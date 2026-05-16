import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPortfolio, getFundDetails } from "../tools/portfolioData.js";
import { ConversationMemory } from "../memory/conversationMemory.js";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class PortfolioAgent {
  constructor(sessionId, userId = "user_tarun_001") {
    this.name = "PortfolioAgent";
    this.description = "Shows mutual fund portfolio, returns, and fund details";
    this.userId = userId;
    this.memory = new ConversationMemory(`portfolio_${sessionId}`);

    this.tools = [
      {
        name: "getPortfolio",
        description: `Gets the user's complete mutual fund portfolio summary.
                      Use when user asks about their portfolio, investments,
                      total value, returns, or overall holdings.`,
        parameters: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "The user ID to fetch portfolio for",
            },
          },
          required: ["userId"],
        },
      },
      {
        name: "getFundDetails",
        description: `Gets details of a specific mutual fund.
                      Use when user asks about a specific fund by name.`,
        parameters: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "The user ID",
            },
            fundName: {
              type: "string",
              description: "Name or partial name of the fund",
            },
          },
          required: ["userId", "fundName"],
        },
      },
    ];
  }

  async process(userMessage) {
    console.log(`\n📊 PortfolioAgent received: "${userMessage}"`);

    const history = await this.memory.getHistory();
    await this.memory.addMessage("user", userMessage);

    const chatHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const model = client.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      systemInstruction: `You are a portfolio advisor for an Indian fintech app.
                          The current user ID is: ${this.userId}
                          Always use this userId when calling tools.
                          Help users understand their mutual fund investments.
                          Format currency in Indian style: ₹3,12,500
                          Show returns as positive/negative clearly.`,
      tools: [{ functionDeclarations: this.tools }],
    });

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(userMessage);
    const response = result.response;

    const functionCall = response.candidates[0].content.parts.find(
      (part) => part.functionCall
    );

    if (functionCall) {
      const { name, args } = functionCall.functionCall;
      console.log(`\n⚙️  Tool called: ${name}`, args);

      let toolResult;
      if (name === "getPortfolio") {
        toolResult = getPortfolio(args.userId);
      } else if (name === "getFundDetails") {
        toolResult = getFundDetails(args.userId, args.fundName);
      }

      console.log(`📊 Tool result:`, toolResult);

      const finalResult = await chat.sendMessage([
        { functionResponse: { name, response: toolResult } },
      ]);

      const finalReply = finalResult.response.text();
      await this.memory.addMessage("model", finalReply);
      console.log(`\n🤖 PortfolioAgent: ${finalReply}`);
      return finalReply;

    } else {
      const reply = response.text();
      await this.memory.addMessage("model", reply);
      console.log(`\n🤖 PortfolioAgent: ${reply}`);
      return reply;
    }
  }
}