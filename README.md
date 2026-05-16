<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:000000,40:0d0d2b,100:1a0533&height=220&section=header&text=Fintech%20Multi-Agent%20AI&fontSize=48&fontColor=ffffff&fontAlignY=42&desc=Production-grade%20AI%20orchestration%20for%20financial%20services&descAlignY=62&descSize=16&descColor=9d7fe8&animation=fadeIn" width="100%"/>

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-6A0DAD?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)

<br/>

> **An LLM-orchestrated backend where natural language queries are intelligently routed to domain-specific AI agents — each equipped with real tools, persistent memory, and production-grade resilience.**

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-9d7fe8?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-00C853?style=flat-square)](CONTRIBUTING.md)
[![Made with ❤️](https://img.shields.io/badge/Made%20with%20❤️%20by-Tarun%20Singh-E0234E?style=flat-square)](https://github.com/tarunsingh)

</div>

---

## 🧠 How It Works

```
POST /chat  { sessionId, message }
                     │
                     ▼
        ┌────────────────────────┐
        │      ORCHESTRATOR      │
        │   Gemini AI — Router   │
        │  Classifies intent     │
        │  No hardcoded keywords │
        └────────┬───────────────┘
                 │
        ┌────────┼────────────────┐
        ▼        ▼                ▼
  ┌──────────┐ ┌──────────────┐ ┌────────────┐
  │  🏦 Loan │ │ 📊 Portfolio │ │ 📈 Market  │
  │  Agent   │ │   Agent      │ │   Agent    │
  │          │ │              │ │            │
  │ EMI Calc │ │ CAMS/KFintech│ │ Live NSE   │
  │  Tool    │ │ Mock Data    │ │ Stock API  │
  └────┬─────┘ └──────┬───────┘ └─────┬──────┘
       │               │               │
       └───────────────┴───────────────┘
                       │
               ┌───────▼────────┐
               │  Redis Memory  │
               │ Per-session    │
               │ conversation   │
               │ history        │
               └────────────────┘
```

---

## ✨ Features

```
🧭  AI-powered routing     — Gemini decides which agent handles each query
🛠️   Tool calling           — Agents run real functions, not text guesses
🧠  Persistent memory      — Redis stores full conversation per session
🔁  Exponential backoff    — Auto-retries on LLM rate limits / 503 spikes
⚡  Multi-tool loop        — One message can trigger multiple tool calls
🌐  Production REST API    — NestJS with validation, CORS, error handling
```

---

## 🤖 Agents & Tools

### 🏦 LoanAgent
Handles all loan-related queries with a real EMI calculator.

```
User: "What's my EMI for a 40L home loan at 8.5% for 20 years?"
  └─► calculateEMI(4000000, 8.5, 20)
      └─► { emi: 34713, totalInterest: 4331000 }
          └─► "Your EMI is ₹34,713/month. Total interest: ₹43,31,000"
```

**Tool:** `calculateEMI(principal, annualRate, tenureYears)`
- Uses standard EMI formula: `P × r × (1+r)^n / ((1+r)^n - 1)`
- Returns EMI, total payment, total interest, tenure in months

---

### 📊 PortfolioAgent
Aggregates mutual fund portfolio data — mirrors real CAMS/KFintech/MFCentral integration.

```
User: "Show my portfolio"
  └─► getPortfolio("user_001")
      └─► { currentValue: 312500, returns: 25%, funds: [...] }

User: "Tell me about my Parag Parikh fund"
  └─► getFundDetails("user_001", "Parag Parikh")
      └─► { nav: 137.2, returns: 34.5%, units: 980.3 }
```

**Tools:**
- `getPortfolio(userId)` — full portfolio summary
- `getFundDetails(userId, fundName)` — specific fund breakdown

---

### 📈 MarketAgent
Fetches live NSE stock prices via Yahoo Finance. Handles multiple stocks in one query.

```
User: "Compare Wipro and TCS"
  └─► getStockPrice("WIPRO") → ₹190.00 ▲ 0.90%
  └─► getStockPrice("TCS")   → ₹2,264.00 ▲ 0.80%
      └─► Side-by-side comparison with change %
```

**Tool:** `getStockPrice(symbol)` — real-time NSE price, change, % change

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Redis running locally
- Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/fintech-ai-agent.git
cd fintech-ai-agent

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Start Redis
brew services start redis   # macOS
sudo service redis start    # Linux

# Start the API
npm run api
```

---

## 📡 API Reference

### `POST /chat`
Send a message and get an AI-powered response.

**Request:**
```json
{
  "sessionId": "user_001",
  "message": "What is my EMI for a 5 lakh loan at 10% for 3 years?"
}
```

**Response:**
```json
{
  "sessionId": "user_001",
  "message": "What is my EMI for a 5 lakh loan at 10% for 3 years?",
  "reply": "Your EMI will be ₹16,134/month. Over 3 years you'll pay ₹80,809 in interest.",
  "duration": "2341ms",
  "timestamp": "2026-05-16T17:35:43.297Z"
}
```

---

### `DELETE /chat/:sessionId`
Clear conversation memory for a session.

```bash
curl -X DELETE http://localhost:3000/chat/user_001
```

```json
{ "sessionId": "user_001", "cleared": true }
```

---

### `GET /health`
Check server status.

```json
{ "status": "ok", "activeSessions": 3, "timestamp": "..." }
```

---

## 💬 Example Conversations

```
👤  EMI for 10 lakh at 9% for 5 years?
🤖  Your EMI is ₹20,758/month. Total repayment: ₹12,45,501.

👤  What if I reduce tenure to 3 years?
🤖  For 3 years, EMI increases to ₹31,799. You save ₹1,12,418 in interest.

👤  Show me my portfolio
🤖  Portfolio value: ₹3,12,500 (+25%). Best performer: Parag Parikh Flexi Cap (+34.5%)

👤  What's the price of HDFC Bank?
🤖  HDFC Bank: ₹767.50 ▼ ₹2.05 (-0.27%)

👤  Based on my portfolio returns, should I prepay my loan?
🤖  Your portfolio returns 25% vs loan cost of 9%. Mathematically,
    staying invested wins — but here's the full framework...
```

> **The last message shows cross-agent reasoning** — the AI connected portfolio context with loan context to give a holistic financial answer.

---

## 🏗️ Project Structure

```
fintech-ai-agent/
├── src/
│   ├── agents/
│   │   ├── Orchestrator.js          # AI-powered intent router
│   │   ├── LoanAgentWithMemory.js   # EMI + loan queries
│   │   ├── PortfolioAgent.js        # Mutual fund portfolio
│   │   └── MarketAgent.js           # Live stock prices
│   ├── tools/
│   │   ├── emiCalculator.js         # EMI math formula
│   │   ├── portfolioData.js         # Mock CAMS/KFintech data
│   │   └── stockPrice.js            # Yahoo Finance API
│   ├── memory/
│   │   └── conversationMemory.js    # Redis-backed chat history
│   ├── utils/
│   │   └── retry.js                 # Exponential backoff
│   ├── chat/
│   │   ├── chat.controller.ts       # HTTP endpoints
│   │   ├── chat.service.ts          # Business logic
│   │   └── chat.dto.ts              # Request validation
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 🔁 Retry & Resilience

LLM APIs spike under load. Every Gemini call uses exponential backoff:

```
Attempt 1 → fails (503)
Attempt 2 → waits 2s  → fails
Attempt 3 → waits 4s  → ✅ success
```

```javascript
await withRetry(
  () => chat.sendMessage(userMessage),
  { maxRetries: 3, baseDelayMs: 2000 }
);
```

---

## 🧩 Key Concepts Demonstrated

| Concept | Where |
|---|---|
| LLM Tool Calling | All agents — AI decides when to call real functions |
| Intent Classification | Orchestrator — AI routes with zero hardcoded keywords |
| Conversation Memory | Redis list per sessionId — full history on every call |
| Exponential Backoff | `utils/retry.js` — wraps every Gemini API call |
| Multi-tool Loop | MarketAgent — handles "Wipro AND TCS" in one message |
| Cross-domain Reasoning | Orchestrator — connects loan + portfolio context |

---

## 🔮 What's Next

```
[ ] Swap mock portfolio with real CAMS/KFintech API
[ ] Add WebSocket support for streaming responses
[ ] Add a SIPAgent for SIP calculator + recommendations
[ ] Dockerize for deployment
[ ] Add rate limiting per sessionId
[ ] Swagger/OpenAPI documentation
```

---

<div align="center">

**Built by [Tarun Kumar Singh](https://github.com/tarunsingh)**

*Senior Backend Engineer — Fintech Infrastructure · AWS · Node.js*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/tarun-singh)
[![Email](https://img.shields.io/badge/Email-Say%20Hello-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:Tarun.singh2376@gmail.com)

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a0533,60:0d0d2b,100:000000&height=100&section=footer&animation=fadeIn" width="100%"/>

</div>