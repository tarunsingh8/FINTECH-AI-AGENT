import { BaseTool } from "./BaseTool.js";

export class StockPriceTool extends BaseTool {
  name() {
    return "getStockPrice";
  }

  description() {
    return `Fetches the current live price of an Indian stock.
            Use for questions about stock price, market value,
            or share price. Common NSE symbols:
            HDFCBANK, RELIANCE, TCS, INFY, WIPRO.
            If user asks for multiple stocks, call once per stock.`;
  }

  parameters() {
    return {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: `NSE stock symbol e.g. HDFCBANK, RELIANCE, TCS`,
        },
      },
      required: ["symbol"],
    };
  }

  async use({ symbol }) {
    try {
      const cleanSymbol = symbol.toUpperCase().includes(".")
        ? symbol.toUpperCase()
        : `${symbol.toUpperCase()}.NS`;

      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${cleanSymbol}?interval=1d&range=1d`;

      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      const data = await response.json();

      if (!data.chart.result || data.chart.error) {
        return { error: `Stock ${symbol} not found` };
      }

      const meta = data.chart.result[0].meta;
      const previousClose =
        meta.previousClose ||
        meta.chartPreviousClose ||
        meta.regularMarketPreviousClose ||
        meta.regularMarketPrice;

      const currentPrice = meta.regularMarketPrice;
      const change = Math.round((currentPrice - previousClose) * 100) / 100;
      const changePercent =
        Math.round(
          ((currentPrice - previousClose) / previousClose) * 10000
        ) / 100;

      return {
        symbol: cleanSymbol,
        companyName: meta.shortName || meta.longName || symbol,
        currentPrice: Math.round(currentPrice * 100) / 100,
        previousClose: Math.round(previousClose * 100) / 100,
        change,
        changePercent,
        currency: meta.currency,
        exchange: meta.exchangeName,
      };
    } catch (error) {
      return { error: `Failed to fetch ${symbol}: ${error.message}` };
    }
  }
}