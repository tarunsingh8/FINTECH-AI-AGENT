import { LoanAgent } from "./agents/LoanAgent.js";

const agent = new LoanAgent();

async function main() {
  // Test 1 — needs tool (EMI calculation)
  await agent.process(
    "What will be my EMI for a 5 lakh loan at 10% interest for 3 years?"
  );

  console.log("\n" + "─".repeat(60) + "\n");

  // Test 2 — needs tool (different numbers)
  await agent.process(
    "I want to take a home loan of 50 lakhs at 8.5% for 20 years. What is the EMI?"
  );

  console.log("\n" + "─".repeat(60) + "\n");

  // Test 3 — no tool needed (general question)
  await agent.process(
    "What documents do I need to apply for a personal loan in India?"
  );
}

main();