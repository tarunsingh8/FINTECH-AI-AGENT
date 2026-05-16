import { GoogleGenerativeAI } from "@google/generative-ai";
import { StockPriceTool } from "../tools/StockPriceTool.js";
import { ConversationMemory } from "../memory/conversationMemory.js";
import { withRetry } from "../utils/retry.js";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class MarketAgent {
  constructor(sessionId) {
    this.name = "MarketAgent";
    this.description = "Fetches live stock and market prices";
    this.memory = new ConversationMemory(`market_${sessionId}`);

    // ← Clean: just instantiate tool classes
    this.tools = [new StockPriceTool()];
  }

  get toolDeclarations() {
    return this.tools.map((t) => t.toFunctionDeclaration());
  }

  async runTool(name, args) {
    const tool = this.tools.find((t) => t.name() === name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    return await tool.use(args);
  }

  async process(userMessage) {
    console.log(`\n📈 MarketAgent received: "${userMessage}"`);

    try {
      const history = await this.memory.getHistory();
      await this.memory.addMessage("user", userMessage);

      const chatHistory = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `You are a market data assistant for an Indian fintech app.
                            Format prices in ₹ with 2 decimal places.
                            Show change as ▲ for positive, ▼ for negative.
                            For multiple stocks, call the tool once per stock.`,
        tools: [{ functionDeclarations: this.toolDeclarations }],
      });

      const chat = model.startChat({ history: chatHistory });

      let currentResult = await withRetry(
        () => chat.sendMessage(userMessage),
        { label: "MarketAgent sendMessage", maxRetries: 3 }
      );

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
          { label: "MarketAgent tool response", maxRetries: 3 }
        );
      }

      const reply = currentResult.response.text() ||
        "Market data fetched. Ask me anything else!";

      await this.memory.addMessage("model", reply);
      console.log(`\n🤖 MarketAgent: ${reply}`);
      return reply;

    } catch (error) {
      console.error(`❌ MarketAgent error:`, error.message);
      return "Market service is temporarily unavailable. Please try again.";
    }
  }
}