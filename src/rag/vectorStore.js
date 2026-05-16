import { ChromaClient } from "chromadb";
import { embedText, embedBatch } from "./embedder.js";
import { documents } from "../documents/fintech-docs.js";

const chroma = new ChromaClient({ path: "http://localhost:8000" });

const COLLECTION_NAME = "fintech_docs";

// Get or create the collection
async function getCollection() {
  return await chroma.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { description: "Fintech policy documents for RAG" },
  });
}

// Ingest all documents into ChromaDB
// Run this ONCE to populate the vector DB
export async function ingestDocuments() {
  console.log("📄 Starting document ingestion...");

  const collection = await getCollection();

  // Check if already ingested
  const existing = await collection.count();
  if (existing > 0) {
    console.log(`✅ ${existing} documents already in ChromaDB. Skipping ingestion.`);
    return;
  }

  console.log(`📐 Embedding ${documents.length} documents...`);

  // Embed all document contents
  const embeddings = await embedBatch(documents.map((d) => d.content));

  // Store in ChromaDB
  await collection.add({
    ids: documents.map((d) => d.id),
    embeddings: embeddings,
    documents: documents.map((d) => d.content),
    metadatas: documents.map((d) => ({
      title: d.title,
      category: d.category,
    })),
  });

  console.log(`✅ ${documents.length} documents ingested into ChromaDB!`);
}

// Search for relevant documents given a query
export async function searchDocuments(query, nResults = 3) {
  const collection = await getCollection();

  // Convert query to vector
  const queryEmbedding = await embedText(query);

  // Find most similar document chunks
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults,
    include: ["documents", "metadatas", "distances"],
  });

  // Format results
  const hits = results.ids[0].map((id, i) => ({
    id,
    content: results.documents[0][i],
    title: results.metadatas[0][i].title,
    category: results.metadatas[0][i].category,
    similarity: 1 - results.distances[0][i], // convert distance to similarity
  }));

  return hits;
}