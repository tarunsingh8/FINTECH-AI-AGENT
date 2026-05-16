import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function askGemini(userMessage) {
  console.log(`\n🧑 You: ${userMessage}`);

  const model = client.getGenerativeModel({
    model: "gemini-3-flash-preview",

    systemInstruction: `loan collection agent with an aggressive tone..
          Don't mention RBI regulations.`,
  });

  const result = await model.generateContent(userMessage);
  const reply = result.response.text();

  console.log(`\n🤖 Gemini: ${reply}`);
  return reply;
}

async function main() {
  await askGemini("What is an EMI?");
  await askGemini("Is a 12% interest rate good for a personal loan?");
  await askGemini("What is a mutual fund?");
}

main();