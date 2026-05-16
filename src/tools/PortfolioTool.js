import { BaseTool } from "./BaseTool.js";

// Mock data — mirrors real CAMS/KFintech/MFCentral integration
const mockPortfolio = {
  user_tarun_001: {
    totalInvested: 250000,
    currentValue: 312500,
    returns: 25.0,
    funds: [
      {
        name: "Axis Bluechip Fund",
        type: "Large Cap Equity",
        invested: 100000,
        currentValue: 128000,
        returns: 28.0,
        units: 1240.5,
        nav: 103.18,
      },
      {
        name: "Parag Parikh Flexi Cap Fund",
        type: "Flexi Cap Equity",
        invested: 100000,
        currentValue: 134500,
        returns: 34.5,
        units: 980.3,
        nav: 137.2,
      },
      {
        name: "HDFC Short Term Debt Fund",
        type: "Debt Fund",
        invested: 50000,
        currentValue: 50000,
        returns: 7.2,
        units: 2100.0,
        nav: 23.81,
      },
    ],
  },
};

// ─── Tool 1: Get full portfolio ───────────────────────────

export class GetPortfolioTool extends BaseTool {
  name() {
    return "getPortfolio";
  }

  description() {
    return `Gets the user's complete mutual fund portfolio summary.
            Use when user asks about portfolio, investments,
            total value, returns, or overall holdings.`;
  }

  parameters() {
    return {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "The user ID to fetch portfolio for",
        },
      },
      required: ["userId"],
    };
  }

  async use({ userId }) {
    const portfolio = mockPortfolio[userId];
    if (!portfolio) return { error: `No portfolio found for ${userId}` };

    return {
      totalInvested: portfolio.totalInvested,
      currentValue: portfolio.currentValue,
      totalGains: portfolio.currentValue - portfolio.totalInvested,
      returnsPercent: portfolio.returns,
      funds: portfolio.funds,
      fundCount: portfolio.funds.length,
    };
  }
}

// ─── Tool 2: Get specific fund details ───────────────────

export class GetFundDetailsTool extends BaseTool {
  name() {
    return "getFundDetails";
  }

  description() {
    return `Gets details of a specific mutual fund by name.
            Use when user asks about a specific fund.`;
  }

  parameters() {
    return {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "The user ID",
        },
        fundName: {
          type: "string",
          description: "Name or partial name of the fund",
        },
      },
      required: ["userId", "fundName"],
    };
  }

  async use({ userId, fundName }) {
    const portfolio = mockPortfolio[userId];
    if (!portfolio) return { error: "User not found" };

    const fund = portfolio.funds.find((f) =>
      f.name.toLowerCase().includes(fundName.toLowerCase())
    );

    if (!fund) return { error: `Fund "${fundName}" not found` };
    return fund;
  }
}