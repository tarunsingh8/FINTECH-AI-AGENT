import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config();


const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function askClaude(userMessage) {
  console.log(`\n🧑 You: ${userMessage}`);

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,

    system: `You are a helpful fintech assistant.
             You help users with loans, investments, and financial queries.
             Always respond in a clear, concise way.`,

    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  console.log(JSON.stringify(response));
  const reply = response.content[0].text;

  console.log(`\nClaude: ${reply}`);
  console.log("\n--- Usage ---");
  console.log(`Input tokens:  ${response.usage.input_tokens}`);
  console.log(`Output tokens: ${response.usage.output_tokens}`);

  return reply;
}

async function main() {
  await askClaude("What is an EMI?");
  await askClaude("Is a 12% interest rate good for a personal loan?");
  await askClaude("What is a mutual fund?");
}

main();