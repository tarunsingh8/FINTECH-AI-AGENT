import { GoogleGenerativeAI } from "@google/generative-ai";
import { DocumentSearchTool } from "../tools/DocumentSearchTool.js";
import { ConversationMemory } from "../memory/conversationMemory.js";
import { withRetry } from "../utils/retry.js";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class DocumentAgent {
  constructor(sessionId) {
    this.name = "DocumentAgent";
    this.description = `Answers questions about fintech policies,
                        RBI guidelines, SEBI regulations, loan eligibility,
                        tax benefits, and investment rules using RAG`;
    this.memory = new ConversationMemory(`docs_${sessionId}`);

    this.tools = [new DocumentSearchTool()];
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
    console.log(`\n📚 DocumentAgent received: "${userMessage}"`);

    try {
      const history = await this.memory.getHistory();
      await this.memory.addMessage("user", userMessage);

      const chatHistory = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `You are a knowledgeable fintech policy advisor.
                            You answer questions using official documents,
                            RBI guidelines, SEBI regulations, and policy docs.
                            ALWAYS use the searchDocuments tool first before answering.
                            Only answer based on retrieved document content.
                            If documents don't have the answer, say so clearly.
                            Always cite the source document in your answer.
                            Be precise and factual — this is regulatory information.`,
        tools: [{ functionDeclarations: this.toolDeclarations }],
      });

      const chat = model.startChat({ history: chatHistory });

      let currentResult = await withRetry(
        () => chat.sendMessage(userMessage),
        { label: "DocumentAgent sendMessage", maxRetries: 3 }
      );

      while (true) {
        const functionCall = currentResult.response.candidates[0].content.parts
          .find((p) => p.functionCall);

        if (!functionCall) break;

        const { name, args } = functionCall.functionCall;
        console.log(`\n⚙️  Tool called: ${name}`, args);

        const toolResult = await this.runTool(name, args);

        currentResult = await withRetry(
          () => chat.sendMessage([
            { functionResponse: { name, response: toolResult } },
          ]),
          { label: "DocumentAgent tool response", maxRetries: 3 }
        );
      }

      const reply = currentResult.response.text() ||
        "I couldn't find relevant information in our documents.";

      await this.memory.addMessage("model", reply);
      console.log(`\n🤖 DocumentAgent: ${reply}`);
      return reply;

    } catch (error) {
      console.error(`❌ DocumentAgent error:`, error.message);
      return "Document search is temporarily unavailable. Please try again.";
    }
  }
}