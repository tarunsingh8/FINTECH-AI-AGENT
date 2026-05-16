import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Convert text to a vector (array of numbers)
// This is the core of RAG — text becomes searchable numbers
export async function embedText(text) {
  const model = client.getGenerativeModel({
    model: "gemini-embedding-001",
  });

  const result = await model.embedContent(text);
  return result.embedding.values; // returns array of ~768 numbers
}

// Embed multiple texts in batch
export async function embedBatch(texts) {
  const embeddings = [];

  for (const text of texts) {
    const embedding = await embedText(text);
    embeddings.push(embedding);

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }

  return embeddings;
}