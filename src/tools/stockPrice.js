export async function getStockPrice(symbol) {
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

    // Yahoo Finance sometimes puts previousClose in different fields
    const previousClose =
      meta.previousClose ||
      meta.chartPreviousClose ||
      meta.regularMarketPreviousClose ||
      meta.regularMarketPrice; // fallback

    const currentPrice = meta.regularMarketPrice;
    const change = Math.round((currentPrice - previousClose) * 100) / 100;
    const changePercent =
      Math.round(((currentPrice - previousClose) / previousClose) * 10000) / 100;

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
    return { error: `Failed to fetch price for ${symbol}: ${error.message}` };
  }
}