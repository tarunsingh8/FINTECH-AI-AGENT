import { LoanAgentWithMemory } from "./agents/LoanAgentWithMemory.js";

// Same session ID = same memory
const agent = new LoanAgentWithMemory("user_tarun_001");

async function main() {
  // Conversation 1 — sets context
  await agent.process(
    "What is the EMI for a 5 lakh loan at 10% for 3 years?"
  );

  console.log("\n" + "─".repeat(60));

  // Conversation 2 — refers to previous loan!
  await agent.process(
    "What if I reduce the tenure to 2 years for the same loan?"
  );

  console.log("\n" + "─".repeat(60));

  // Conversation 3 — still remembers!
  await agent.process(
    "How much total interest will I save with the 2 year option?"
  );

  console.log("\n" + "─".repeat(60));

  // Conversation 4 — completely different topic, still in context
  await agent.process(
    "Which option would you recommend for someone with a salary of 50k/month?"
  );

  // Show what's stored in Redis
  await agent.memory.debug();

  process.exit(0);
}

main();