import { GoogleGenerativeAI } from "@google/generative-ai";
import { LoanAgentWithMemory } from "./LoanAgentWithMemory.js";
import { PortfolioAgent } from "./PortfolioAgent.js";
import { MarketAgent } from "./MarketAgent.js";
import { DocumentAgent } from "./DocumentAgent.js";          // ← add
import { ConversationMemory } from "../memory/conversationMemory.js";
import { withRetry } from "../utils/retry.js";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class Orchestrator {
  constructor(sessionId) {
    this.sessionId = sessionId;

    this.agents = {
      LoanAgent      : new LoanAgentWithMemory(sessionId),
      PortfolioAgent : new PortfolioAgent(sessionId),
      MarketAgent    : new MarketAgent(sessionId),
      DocumentAgent  : new DocumentAgent(sessionId),          // ← add
    };

    this.memory = new ConversationMemory(`orchestrator_${sessionId}`);
  }

  async classifyIntent(userMessage, history) {
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    const recentHistory = history
      .slice(-4)
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `
You are a routing assistant for a fintech AI system.
Based on the user message, decide which agent should handle it.

Available agents:
- LoanAgent      : EMI calculations, interest rates, loan eligibility, repayment
- PortfolioAgent : Mutual fund portfolio, investments, fund details, returns
- MarketAgent    : Live stock prices, share prices, NSE/BSE market data
- DocumentAgent  : RBI guidelines, SEBI regulations, loan policies, tax benefits,
                   CIBIL score info, investment rules, eligibility criteria,
                   any question about rules/regulations/policies/guidelines

Recent conversation:
${recentHistory || "No history yet"}

User message: "${userMessage}"

Reply with ONLY one of: LoanAgent | PortfolioAgent | MarketAgent | DocumentAgent | General

Rules:
- Calculation questions (EMI, returns math) → LoanAgent or PortfolioAgent
- Live price questions → MarketAgent
- Policy/regulation/rule/eligibility/tax/guideline questions → DocumentAgent
- Greetings or off-topic → General
`;

    const result = await withRetry(
      () => model.generateContent(prompt),
      { label: "Intent classification", maxRetries: 3 }
    );

    const intent = result.response.text().trim();
    console.log(`\n🧭 Orchestrator routed to: ${intent}`);
    return intent;
  }

  async handleGeneral(userMessage) {
    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are a helpful fintech assistant.
                          You can help with:
                          • Loan EMI calculations
                          • Mutual fund portfolio queries
                          • Live stock prices
                          • RBI/SEBI guidelines and policies
                          Keep responses short and friendly.`,
    });

    const result = await withRetry(
      () => model.generateContent(userMessage),
      { label: "General response", maxRetries: 3 }
    );

    return result.response.text();
  }

  async process(userMessage) {
    console.log(`\n${"═".repeat(55)}`);
    console.log(`👤 User: ${userMessage}`);
    console.log(`${"═".repeat(55)}`);

    try {
      const history = await this.memory.getHistory();
      const intent = await this.classifyIntent(userMessage, history);

      let reply;

      if (intent === "LoanAgent") {
        reply = await this.agents.LoanAgent.process(userMessage);
      } else if (intent === "PortfolioAgent") {
        reply = await this.agents.PortfolioAgent.process(userMessage);
      } else if (intent === "MarketAgent") {
        reply = await this.agents.MarketAgent.process(userMessage);
      } else if (intent === "DocumentAgent") {
        reply = await this.agents.DocumentAgent.process(userMessage);
      } else {
        reply = await this.handleGeneral(userMessage);
        console.log(`\n🤖 Assistant: ${reply}`);
      }

      await this.memory.addMessage("user", userMessage);
      await this.memory.addMessage("model", `[${intent}]: ${reply}`);

      return reply;

    } catch (error) {
      console.error(`❌ Orchestrator error:`, error.message);
      return "I'm experiencing issues right now. Please try again.";
    }
  }
}