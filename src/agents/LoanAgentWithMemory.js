import { GoogleGenerativeAI } from "@google/generative-ai";
import { EMICalculatorTool } from "../tools/EMICalculatorTool.js";
import { ConversationMemory } from "../memory/conversationMemory.js";
import { withRetry } from "../utils/retry.js";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class LoanAgentWithMemory {
  constructor(sessionId) {
    this.name = "LoanAgent";
    this.description = "Handles loan queries and EMI calculations";
    this.memory = new ConversationMemory(sessionId);

    // ← Clean: just instantiate tool classes
    this.tools = [new EMICalculatorTool()];
  }

  // Convert tools to Gemini format
  get toolDeclarations() {
    return this.tools.map((t) => t.toFunctionDeclaration());
  }

  // Find and run tool by name
  async runTool(name, args) {
    const tool = this.tools.find((t) => t.name() === name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    return await tool.use(args);
  }

  async process(userMessage) {
    console.log(`\n🧑 You: ${userMessage}`);

    try {
      const history = await this.memory.getHistory();
      await this.memory.addMessage("user", userMessage);

      const chatHistory = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `You are a helpful loan advisor for an Indian fintech company.
                            Help users understand loans and EMIs.
                            Use calculateEMI tool for any EMI calculation.
                            Never guess numbers — always use the tool.
                            Format amounts in Indian style: ₹16,133`,
        tools: [{ functionDeclarations: this.toolDeclarations }],
      });

      const chat = model.startChat({ history: chatHistory });

      let currentResult = await withRetry(
        () => chat.sendMessage(userMessage),
        { label: "LoanAgent sendMessage", maxRetries: 3 }
      );

      // Loop for multiple tool calls
      while (true) {
        const functionCall = currentResult.response.candidates[0].content.parts
          .find((p) => p.functionCall);

        if (!functionCall) break;

        const { name, args } = functionCall.functionCall;
        console.log(`\n⚙️  Tool called: ${name}`, args);

        const toolResult = await this.runTool(name, args);
        console.log(`📊 Tool result:`, toolResult);

        currentResult = await withRetry(
          () => chat.sendMessage([
            { functionResponse: { name, response: toolResult } },
          ]),
          { label: "LoanAgent tool response", maxRetries: 3 }
        );
      }

      const reply = currentResult.response.text() ||
        "I processed that. What else can I help you with?";

      await this.memory.addMessage("model", reply);
      console.log(`\n🤖 LoanAgent: ${reply}`);
      return reply;

    } catch (error) {
      console.error(`❌ LoanAgent error:`, error.message);
      return "Loan service is temporarily unavailable. Please try again.";
    }
  }
}