import { GoogleGenerativeAI } from "@google/generative-ai";
import { LoanAgentWithMemory } from "./LoanAgentWithMemory.js";
import { PortfolioAgent } from "./PortfolioAgent.js";
import { MarketAgent } from "./MarketAgent.js";
import { ConversationMemory } from "../memory/conversationMemory.js";
import { withRetry } from "../utils/retry.js";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class Orchestrator {
    constructor(sessionId) {
        this.sessionId = sessionId;

        // Boot up all agents
        this.agents = {
            LoanAgent: new LoanAgentWithMemory(sessionId),
            PortfolioAgent: new PortfolioAgent(sessionId),
            MarketAgent: new MarketAgent(sessionId),
        };

        // Shared memory for orchestrator decisions
        this.memory = new ConversationMemory(`orchestrator_${sessionId}`);
    }

    // Step 1 — Ask AI which agent should handle this message
    async classifyIntent(userMessage, history) {
        const model = client.getGenerativeModel({
            model: "gemini-3.1-flash-lite",
        });

        // Build context from last 4 messages so AI understands conversation flow
        const recentHistory = history
            .slice(-4)
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n");

        const prompt = `
You are a routing assistant for a fintech AI system.
Based on the user message, decide which agent should handle it.

Available agents:
- LoanAgent      : loan EMI calculations, interest rates, loan eligibility, repayment queries
- PortfolioAgent : mutual fund portfolio, investments, fund details, returns, NAV
- MarketAgent    : live stock prices, share prices, market data, NSE/BSE stocks

Recent conversation:
${recentHistory || "No history yet"}

User message: "${userMessage}"

Reply with ONLY one of these exact words:
LoanAgent | PortfolioAgent | MarketAgent | General

Rules:
- If message is about loans, EMI, interest → LoanAgent
- If message is about portfolio, mutual funds, investments → PortfolioAgent
- If message is about stocks, share price, market → MarketAgent
- If it's a greeting or unrelated question → General
`;

        const result = await withRetry(
            () => model.generateContent(prompt),
            { label: "Intent classification", maxRetries: 3 }
        );

        const intent = result.response.text().trim();
        console.log(`\n🧭 Orchestrator routed to: ${intent}`);
        return intent;
    }

    // Step 2 — Handle general messages (greetings, unknown queries)
    async handleGeneral(userMessage) {
        const model = client.getGenerativeModel({
            model: "gemini-3.1-flash-lite",
            systemInstruction: `You are a helpful fintech assistant.
                          You can help with:
                          • Loan EMI calculations
                          • Mutual fund portfolio queries
                          • Live stock prices
                          Keep responses short and friendly.
                          If user asks something outside these topics,
                          politely guide them back.`,
        });

        const result = await withRetry(
            () => model.generateContent(userMessage),
            { label: "General response", maxRetries: 3 }
        );

        return result.response.text();
    }

    // Step 3 — Main entry point
    async process(userMessage) {
        console.log(`\n${"═".repeat(55)}`);
        console.log(`👤 User: ${userMessage}`);
        console.log(`${"═".repeat(55)}`);

        try {
            // Get history for context-aware routing
            const history = await this.memory.getHistory();

            // Classify intent
            const intent = await this.classifyIntent(userMessage, history);

            let reply;

            // Route to correct agent
            if (intent === "LoanAgent") {
                reply = await this.agents.LoanAgent.process(userMessage);

            } else if (intent === "PortfolioAgent") {
                reply = await this.agents.PortfolioAgent.process(userMessage);

            } else if (intent === "MarketAgent") {
                reply = await this.agents.MarketAgent.process(userMessage);

            } else {
                // General or unrecognised
                reply = await this.handleGeneral(userMessage);
                console.log(`\n🤖 Assistant: ${reply}`);
            }

            // Save to orchestrator memory for routing context
            await this.memory.addMessage("user", userMessage);
            await this.memory.addMessage("model", `[${intent}]: ${reply}`);

            return reply;

        } catch (error) {
            console.error(`❌ Orchestrator error:`, error.message);
            return "I'm experiencing issues right now. Please try again.";
        }
    }
}