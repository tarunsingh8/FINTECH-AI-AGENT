<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:000000,40:0d0d2b,100:1a0533&height=240&section=header&text=Fintech%20Multi-Agent%20AI&fontSize=48&fontColor=ffffff&fontAlignY=40&desc=LLM%20Orchestration%20·%20RAG%20Pipeline%20·%20Vector%20Search%20·%20Redis%20Memory&descAlignY=60&descSize=15&descColor=9d7fe8&animation=fadeIn" width="100%"/>

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-FF6B35?style=for-the-badge&logo=databricks&logoColor=white)](https://trychroma.com)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-6A0DAD?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)

<br/>

> **Production-grade multi-agent fintech AI system featuring LLM orchestration, tool calling, RAG pipelines, vector search, Redis conversational memory, and cross-agent reasoning.**

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-9d7fe8?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-00C853?style=flat-square)](CONTRIBUTING.md)
[![Built by Tarun](https://img.shields.io/badge/Built%20by-Tarun%20Kumar%20Singh-E0234E?style=flat-square)](https://github.com/tarunsingh)

</div>

---

# 🎥 Multi-Agent Workflow
<div align="center">

### 🧠 AI Request Lifecycle

```mermaid
sequenceDiagram
    autonumber

    participant U as 👤 User
    participant O as 🧠 Orchestrator
    participant A as 🤖 AI Agent
    participant T as 🛠️ Tool Layer
    participant V as 🔍 Vector DB
    participant R as 💾 Redis Memory

    U->>O: Send Query

    O->>O: Intent Classification

    alt Loan Query
        O->>A: Route to LoanAgent
        A->>T: calculateEMI()
        T-->>A: EMI Result
    else Market Query
        O->>A: Route to MarketAgent
        A->>T: getStockPrice()
        T-->>A: Live Market Data
    else Document Query
        O->>A: Route to DocumentAgent
        A->>V: Vector Similarity Search
        V-->>A: Retrieved Context
    end

    A->>R: Store Conversation Context
    R-->>A: Previous Memory

    A-->>O: AI Generated Response
    O-->>U: Final Answer
```

</div>

---

# 🧠 System Architecture
<details>
<summary>ASCII Architecture</summary>

```text
POST /chat  { sessionId, message }
                      │
                      ▼
        ┌─────────────────────────┐
        │       ORCHESTRATOR      │
        │   Gemini AI — Router    │
        │  Zero hardcoded keywords│
        │  Pure LLM intent routing│
        └────────────┬────────────┘
                     │
       ┌─────────────┼──────────────┬─────────────┐
       ▼             ▼              ▼             ▼
 ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌────────────┐
 │ 🏦 Loan  │ │📊Portfolio│ │📈 Market │ │📚 Document │
 │  Agent   │ │  Agent    │ │  Agent   │ │   Agent    │
 │ EMI Calc │ │ Portfolio │ │  Stock   │ │  RAG       │
 │  Tool    │ │ Fund Tools│ │Price Tool│ │  Search    │
 └────┬─────┘ └─────┬─────┘ └────┬─────┘ └──────┬─────┘
      │              │             │              │
      │              │             │       ┌──────▼──────┐
      │              │             │       │  ChromaDB   │
      │              │             │       │Vector Search│
      │              │             │       │Gemini Embed │
      │              │             │       │text-embed   │
      │              │             │       │-004         │
      └──────────────┴─────────────┴───────┴──────┬──────┘
                                                   │
                                    ┌──────────────▼──────────┐
                                    │       Redis Memory       │
                                    │  Per-session history     │
                                    │  Persists across calls   │
                                    └─────────────────────────┘
```

</details>

---

# ⚙️ End-to-End Execution Flow

<div align="center">

```mermaid
flowchart TD

    A["👤 User Message"]
    style A fill:#111827,color:#ffffff,stroke:#7c3aed,stroke-width:2px

    B["🧠 Gemini Orchestrator"]
    style B fill:#1e1b4b,color:#ffffff,stroke:#8b5cf6,stroke-width:3px

    C{"🎯 Intent Classification"}
    style C fill:#312e81,color:#ffffff,stroke:#a855f7,stroke-width:3px

    D["🏦 LoanAgent"]
    style D fill:#052e16,color:#ffffff,stroke:#22c55e,stroke-width:2px

    E["📈 MarketAgent"]
    style E fill:#082f49,color:#ffffff,stroke:#38bdf8,stroke-width:2px

    F["📊 PortfolioAgent"]
    style F fill:#3f1d2e,color:#ffffff,stroke:#ec4899,stroke-width:2px

    G["📚 DocumentAgent"]
    style G fill:#3b0764,color:#ffffff,stroke:#c084fc,stroke-width:2px

    H["🧮 EMI Calculator Tool"]
    style H fill:#14532d,color:#ffffff,stroke:#4ade80,stroke-width:2px

    I["📡 Live Stock API"]
    style I fill:#0c4a6e,color:#ffffff,stroke:#38bdf8,stroke-width:2px

    J["💰 Portfolio Tools"]
    style J fill:#831843,color:#ffffff,stroke:#f472b6,stroke-width:2px

    K["🔍 ChromaDB Vector Search"]
    style K fill:#581c87,color:#ffffff,stroke:#d946ef,stroke-width:2px

    L["🧠 Gemini Embeddings"]
    style L fill:#4c1d95,color:#ffffff,stroke:#a78bfa,stroke-width:2px

    M["💾 Redis Memory"]
    style M fill:#7f1d1d,color:#ffffff,stroke:#f87171,stroke-width:3px

    N["🤖 Final AI Response"]
    style N fill:#111827,color:#ffffff,stroke:#22d3ee,stroke-width:3px

    A --> B
    B --> C

    C -->|Loan Query| D
    C -->|Market Query| E
    C -->|Portfolio Query| F
    C -->|Document Query| G

    D --> H
    E --> I
    F --> J
    G --> K

    K --> L

    H --> M
    I --> M
    J --> M
    L --> M

    M --> N
```

</div>

---

# 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Node.js, NestJS, TypeScript |
| AI Layer | Gemini AI |
| Vector Database | ChromaDB |
| Memory Layer | Redis |
| Embeddings | Gemini text-embedding-004 |
| APIs | REST |
| Architecture | Multi-Agent System |
| Retrieval | RAG Pipeline |
| Infra | Docker-ready |

---

# 🎯 Why This Project Matters

This project demonstrates how modern AI systems move beyond simple chatbot interactions into production-grade autonomous workflows.

The system combines:

- LLM orchestration
- dynamic tool execution
- retrieval-augmented generation (RAG)
- vector similarity search
- conversational memory
- cross-domain reasoning

to simulate real-world fintech AI assistants operating at scale.

---

# ✨ Features

```text
🧭  AI-powered routing      Zero hardcoded keywords — Gemini classifies intent
🛠️   Tool calling            Agents execute real functions dynamically
🧠  RAG Pipeline            Semantic document retrieval using vector search
📐  Text Embeddings         Gemini text-embedding-004 converts text → vectors
🗄️   Vector Database         ChromaDB stores and retrieves embeddings
🔖  Source Citation         Grounded responses with document references
💾  Persistent Memory       Redis-backed conversational memory
🔁  Exponential Backoff     Automatic retry handling for LLM failures
⚡  Multi-tool Loop         Multiple sequential tool invocations
🌐  Production REST API     NestJS API with validation and session handling
🧩  BaseTool Pattern        Plug-and-play tool abstraction architecture
```

---

# 🏭 Production Engineering Highlights

- Stateless REST APIs with session-based conversational memory
- Redis-backed distributed chat persistence
- Exponential retry handling for LLM failures and rate limits
- Modular tool abstraction for rapid agent expansion
- AI-first orchestration with zero keyword routing
- Retrieval-Augmented Generation (RAG) with semantic vector search
- Cross-agent contextual reasoning
- Multi-tool execution loop for compound requests
- Strong separation between orchestration, tools, memory, and retrieval layers

---

# 🤖 Agents

## 🏦 LoanAgent — Real EMI Calculations

```text
User: "What's my EMI for a 40L home loan at 8.5% for 20 years?"
         │
         ▼
calculateEMI(4000000, 8.5, 20)
         │
         ▼
{ emi: 34713, totalInterest: 4331120, totalPayment: 8331120 }
         │
         ▼
"Your EMI is ₹34,713/month"
```

---

## 📊 PortfolioAgent — Mutual Fund Portfolio

```text
User: "Show my portfolio"
         │
         ▼
getPortfolio("user_001")
         │
         ▼
₹3,12,500 current value
+25% overall returns
```

---

## 📈 MarketAgent — Live NSE Stock Prices

```text
User: "Compare Wipro and TCS"
         │
         ▼
getStockPrice("WIPRO")
getStockPrice("TCS")
         │
         ▼
AI-generated comparison response
```

---

## 📚 DocumentAgent — RAG Pipeline

```text
User: "Can banks charge prepayment penalty?"
         │
         ▼
embed(query)
         │
         ▼
ChromaDB similarity search
         │
         ▼
Retrieve RBI guidelines
         │
         ▼
Gemini generates grounded answer
```

---

# 📄 Document Knowledge Base

| Document | Category |
|---|---|
| RBI Guidelines on Loan Prepayment | RBI Guidelines |
| SEBI Mutual Fund Regulations | SEBI Regulations |
| Personal Loan Eligibility Criteria | Loan Policy |
| Home Loan Tax Benefits | Tax Benefits |
| Mutual Fund Taxation | Tax Benefits |
| Understanding CIBIL Score | Credit Score |
| Benefits of SIP Investment | Investment |

---

# 📺 Runtime Demonstration

| Tool Calling | RAG Retrieval |
|---|---|
| ![](./assets/tool-call.gif) | ![](./assets/rag-search.gif) |

---

# 💬 Real Conversation Examples

```text
👤 EMI for 10 lakh at 9% for 5 years?
🧭 → LoanAgent
🤖 Your EMI is ₹20,758/month.

👤 Show me my portfolio
🧭 → PortfolioAgent
🤖 Portfolio: ₹3,12,500 (+25%)

👤 What is TCS stock price?
🧭 → MarketAgent
🤖 TCS: ₹2,264.00 ▲ ₹18 (+0.80%)

👤 Can banks charge prepayment penalty?
🧭 → DocumentAgent
🤖 RBI mandates banks cannot charge penalties
```

---

# 🚀 Quick Start

## Prerequisites

- Node.js 18+
- Python 3.9+
- Redis
- Gemini API Key

---

## Installation

```bash
git clone https://github.com/yourusername/fintech-ai-agent.git

cd fintech-ai-agent

npm install

pip3 install chromadb

cp .env.example .env
```

---

## Start Services

```bash
# ChromaDB
chroma run --host localhost --port 8000

# Redis
brew services start redis

# Ingest documents
npm run ingest

# Start API
npm run api
```

---

# 📡 API Reference

## POST /chat

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user_001",
    "message": "Can banks charge prepayment penalty on my home loan?"
  }'
```

---

## DELETE /chat/:sessionId

```bash
curl -X DELETE http://localhost:3000/chat/user_001
```

---

## GET /health

```bash
curl http://localhost:3000/health
```

---

# 🏗️ Project Structure

```text
fintech-ai-agent/
├── src/
│   ├── agents/
│   ├── tools/
│   ├── rag/
│   ├── memory/
│   ├── chat/
│   ├── utils/
│   └── app.module.ts
├── assets/
├── package.json
├── tsconfig.json
└── README.md
```

---

# 🧩 Key Concepts Implemented

| Concept | Implementation |
|---|---|
| LLM Tool Calling | Dynamic tool invocation |
| Multi-Agent Architecture | AI-powered routing |
| RAG Pipeline | Retrieval → Context → Answer |
| Text Embeddings | Gemini embeddings |
| Semantic Search | Vector similarity retrieval |
| Conversation Memory | Redis session persistence |
| Exponential Backoff | Retry handling |
| Cross-Agent Reasoning | Shared conversational context |

---

# 🔮 Future Improvements

```text
[ ] SIP recommendation agent
[ ] Docker Compose setup
[ ] Streaming responses
[ ] Swagger documentation
[ ] Unit & integration tests
[ ] Rate limiting
[ ] Kubernetes deployment
```

---

# 🛡️ Resilience Patterns

```javascript
await withRetry(
  () => chat.sendMessage(userMessage),
  {
    maxRetries: 3,
    baseDelayMs: 2000,
  }
);
```

---

<div align="center">

## Built By Tarun Kumar Singh

Senior Backend Engineer · AI Systems · Distributed Infrastructure · Fintech

<br/>

[![LinkedIn](https://img.shields.io/badge/Connect-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tarunsingh)

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a0533,60:0d0d2b,100:000000&height=120&section=footer"/>

</div>
