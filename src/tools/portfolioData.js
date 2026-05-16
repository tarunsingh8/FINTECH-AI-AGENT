// Mock data — simulating what CAMS/KFintech would return
// This mirrors the real portfolio aggregation API you built at Abhi Loans!

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

export function getPortfolio(userId) {
  const portfolio = mockPortfolio[userId];

  if (!portfolio) {
    return { error: `No portfolio found for user ${userId}` };
  }

  const gains = portfolio.currentValue - portfolio.totalInvested;

  return {
    totalInvested: portfolio.totalInvested,
    currentValue: portfolio.currentValue,
    totalGains: gains,
    returnsPercent: portfolio.returns,
    funds: portfolio.funds,
    fundCount: portfolio.funds.length,
  };
}

export function getFundDetails(userId, fundName) {
  const portfolio = mockPortfolio[userId];
  if (!portfolio) return { error: "User not found" };

  const fund = portfolio.funds.find((f) =>
    f.name.toLowerCase().includes(fundName.toLowerCase())
  );

  if (!fund) return { error: `Fund "${fundName}" not found` };
  return fund;
}