import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateEMI } from "../tools/emiCalculator.js";
import { ConversationMemory } from "../memory/conversationMemory.js";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class LoanAgentWithMemory {
  constructor(sessionId) {
    this.name = "LoanAgent";
    this.memory = new ConversationMemory(sessionId);

    this.tools = [
      {
        name: "calculateEMI",
        description: `Calculates the monthly EMI for a loan.
                      Use this whenever user asks about EMI,
                      monthly payment, or loan repayment amount.`,
        parameters: {
          type: "object",
          properties: {
            principal: {
              type: "number",
              description: "Loan amount in rupees",
            },
            annualRate: {
              type: "number",
              description: "Annual interest rate as percentage",
            },
            tenureYears: {
              type: "number",
              description: "Loan tenure in years",
            },
          },
          required: ["principal", "annualRate", "tenureYears"],
        },
      },
    ];
  }

  async process(userMessage) {
    console.log(`\n🧑 You: ${userMessage}`);

    // Step 1 — Save user message to Redis
    await this.memory.addMessage("user", userMessage);

    // Step 2 — Get full history from Redis
    const history = await this.memory.getHistory();

    // Step 3 — Convert history to Gemini format
    // Gemini needs: [{ role: "user", parts: [{text: "..."}] }]
    const chatHistory = history
      .slice(0, -1) // all except current message
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    const model = client.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      systemInstruction: `You are a helpful loan advisor for an Indian fintech company.
                          You help users understand their loans and EMIs.
                          When user asks about EMI or monthly payment, use the calculateEMI tool.
                          Remember context from previous messages in conversation.
                          If user says "same loan" or "that loan", refer to conversation history.
                          Format amounts in Indian style: ₹16,133`,
      tools: [{ functionDeclarations: this.tools }],
    });

    // Step 4 — Start chat WITH history
    const chat = model.startChat({ history: chatHistory });

    // Step 5 — Send current message
    const result = await chat.sendMessage(userMessage);
    const response = result.response;

    // Step 6 — Check if AI wants to use a tool
    const functionCall = response.candidates[0].content.parts.find(
      (part) => part.functionCall
    );

    if (functionCall) {
      const { name, args } = functionCall.functionCall;
      console.log(`\n⚙️  Tool called: ${name}`, args);

      let toolResult;
      if (name === "calculateEMI") {
        toolResult = calculateEMI(
          args.principal,
          args.annualRate,
          args.tenureYears
        );
      }

      console.log(`📊 Tool result:`, toolResult);

      // Step 7 — Send tool result back
      const finalResult = await chat.sendMessage([
        {
          functionResponse: {
            name,
            response: toolResult,
          },
        },
      ]);

      const finalReply = finalResult.response.text();

      // Step 8 — Save AI response to Redis
      await this.memory.addMessage("model", finalReply);

      console.log(`\n🤖 LoanAgent: ${finalReply}`);
      return finalReply;

    } else {
      const reply = response.text();

      // Save AI response to Redis
      await this.memory.addMessage("model", reply);

      console.log(`\n🤖 LoanAgent: ${reply}`);
      return reply;
    }
  }
}