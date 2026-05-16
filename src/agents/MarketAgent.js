import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStockPrice } from "../tools/stockPrice.js";
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

    this.tools = [
      {
        name: "getStockPrice",
        description: `Fetches the current live price of a stock.
                      Use for any question about stock price, market value,
                      or share price. For Indian stocks use NSE symbols
                      like HDFCBANK, RELIANCE, TCS, INFY, WIPRO.
                      If user asks for multiple stocks, call this tool
                      multiple times — once per stock.`,
        parameters: {
          type: "object",
          properties: {
            symbol: {
              type: "string",
              description: `Stock symbol e.g. HDFCBANK for HDFC Bank,
                            RELIANCE for Reliance Industries,
                            TCS for Tata Consultancy Services,
                            INFY for Infosys, WIPRO for Wipro`,
            },
          },
          required: ["symbol"],
        },
      },
    ];
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
        model: "gemini-3.1-flash-lite",
        systemInstruction: `You are a market data assistant for an Indian fintech app.
                            Help users get live stock prices and market info.
                            For Indian stocks, use NSE symbols automatically.
                            Format prices in ₹ with 2 decimal places.
                            Show price change as ▲ for positive, ▼ for negative.
                            If user asks for multiple stocks, call the tool
                            once for each stock separately.`,
        tools: [{ functionDeclarations: this.tools }],
      });

      const chat = model.startChat({ history: chatHistory });

      // Step 1 — Send user message
      let currentResult = await withRetry(
        () => chat.sendMessage(userMessage),
        { label: "Gemini sendMessage", maxRetries: 3 }
      );

      // Step 2 — Loop to handle multiple tool calls
      // (e.g. user asks for Reliance AND TCS — 2 separate tool calls)
      while (true) {
        const functionCall = currentResult.response.candidates[0].content.parts
          .find((part) => part.functionCall);

        if (!functionCall) break;

        const { name, args } = functionCall.functionCall;
        console.log(`\n⚙️  Tool called: ${name}`, args);

        let toolResult;
        if (name === "getStockPrice") {
          toolResult = await getStockPrice(args.symbol);
        }

        console.log(`📊 Tool result:`, toolResult);

        // Step 4 — Send tool result back to AI
        currentResult = await withRetry(
          () => chat.sendMessage([
            { functionResponse: { name, response: toolResult } },
          ]),
          { label: "Gemini tool response", maxRetries: 3 }
        );
      }

      // Step 5 — Get final reply
      // Fallback to manual formatting if Gemini returns empty
      let finalReply = currentResult.response.text();

      if (!finalReply || finalReply.trim() === "") {
        finalReply = "I fetched the stock data. Please ask me again for the details.";
      }

      await this.memory.addMessage("model", finalReply);
      console.log(`\n🤖 MarketAgent: ${finalReply}`);
      return finalReply;

    } catch (error) {
      const fallback = "Market data service is experiencing high load. Please try again in a moment.";
      console.error(`❌ MarketAgent failed:`, error.message);
      return fallback;
    }
  }
}