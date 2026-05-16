import { ingestDocuments } from "./vectorStore.js";

async function main() {
  console.log("🚀 Starting ChromaDB ingestion...\n");

  try {
    await ingestDocuments();
    console.log("\n🎉 Ingestion complete! ChromaDB is ready.");
    console.log("You can now run the API and query documents.");
  } catch (error) {
    console.error("❌ Ingestion failed:", error.message);
    console.log("\nMake sure ChromaDB is running:");
    console.log("  chroma run --host localhost --port 8000");
  }

  process.exit(0);
}

main();