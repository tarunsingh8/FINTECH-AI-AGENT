import { Orchestrator } from "./agents/Orchestrator.js";

const orchestrator = new Orchestrator("session_tarun_001");

// Helper to add spacing between queries
async function ask(question) {
  await orchestrator.process(question);
  console.log();
}

async function main() {

  // 1 — Greeting (General)
  await ask("Hey! What can you help me with?");

  // 2 — Loan query (LoanAgent)
  await ask("I want to take a home loan of 40 lakhs at 8.5% for 20 years");

  // 3 — Follow up on loan (LoanAgent — remembers context)
  await ask("What if I take it for 15 years instead?");

  // 4 — Portfolio query (PortfolioAgent)
  await ask("Show me my investment portfolio");

  // 5 — Specific fund (PortfolioAgent — remembers context)
  await ask("Which of my funds is performing best?");

  // 6 — Stock price (MarketAgent)
  await ask("What is the current price of Infosys?");

  // 7 — Multiple stocks (MarketAgent)
  await ask("Compare Wipro and TCS prices");

  // 8 — Mixed context (tests routing accuracy)
  await ask("Based on my portfolio returns, should I prepay my home loan?");

  process.exit(0);
}

main();