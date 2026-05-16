import { BaseTool } from "./BaseTool.js";
import { searchDocuments } from "../rag/vectorStore.js";

export class DocumentSearchTool extends BaseTool {
  name() {
    return "searchDocuments";
  }

  description() {
    return `Searches fintech policy documents including RBI guidelines,
            SEBI regulations, loan eligibility criteria, tax benefits,
            CIBIL score information, and SIP/investment guides.
            Use when user asks about regulations, policies, rules,
            eligibility, tax benefits, or any guidelines.`;
  }

  parameters() {
    return {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The question or topic to search in documents",
        },
      },
      required: ["query"],
    };
  }

  async use({ query }) {
    console.log(`\n🔍 Searching documents for: "${query}"`);

    const results = await searchDocuments(query, 3);

    if (results.length === 0) {
      return { found: false, message: "No relevant documents found" };
    }

    // Format for AI consumption
    const context = results
      .map((r, i) =>
        `[Source ${i + 1}: ${r.title}]\n${r.content}`
      )
      .join("\n\n");

    console.log(`📚 Found ${results.length} relevant chunks:`);
    results.forEach((r) =>
      console.log(`   • ${r.title} (similarity: ${r.similarity.toFixed(2)})`)
    );

    return {
      found: true,
      resultsCount: results.length,
      context,
      sources: results.map((r) => ({
        title: r.title,
        category: r.category,
        similarity: r.similarity.toFixed(2),
      })),
    };
  }
}