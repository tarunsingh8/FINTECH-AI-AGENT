import { LoanAgentWithMemory } from "./agents/LoanAgentWithMemory.js";
import { PortfolioAgent } from "./agents/PortfolioAgent.js";
import { MarketAgent } from "./agents/MarketAgent.js";

const sessionId = "session_001";

const loanAgent      = new LoanAgentWithMemory(sessionId);
const portfolioAgent = new PortfolioAgent(sessionId);
const marketAgent    = new MarketAgent(sessionId);

async function main() {

  console.log("\n" + "═".repeat(60));
  console.log("🏦 TESTING LOAN AGENT");
  console.log("═".repeat(60));
  await loanAgent.process("EMI for 10 lakh loan at 9% for 5 years?");

  console.log("\n" + "═".repeat(60));
  console.log("📊 TESTING PORTFOLIO AGENT");
  console.log("═".repeat(60));
  await portfolioAgent.process("Show me my portfolio summary");
  await portfolioAgent.process("Tell me more about my Parag Parikh fund");

  console.log("\n" + "═".repeat(60));
  console.log("📈 TESTING MARKET AGENT");
  console.log("═".repeat(60));
  await marketAgent.process("What is the current price of HDFC Bank?");
  await marketAgent.process("How about Reliance and TCS?");

  process.exit(0);
}

main();