export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  price: number;
  prevClose: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  dividendYield: number;
  debtToEquity: number;
  roe: number;
  roce: number;
  eps: number;
  revenueGrowth: number;
  profitMargin: number;
  freeCashFlow: number;
  currentRatio: number;
  quickRatio: number;
  assetTurnover: number;
  high52Week: number;
  low52Week: number;
  beta: number;
  // Pre-calculated indicator snapshots
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
  rsi14: number;
  bollingerUpper: number;
  bollingerLower: number;
  volumeProfilePoc: number;
}

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  choice<T>(arr: T[]): T {
    const idx = Math.floor(this.next() * arr.length);
    return arr[idx];
  }
}

export const SECTORS = [
  "Technology",
  "Financials",
  "Healthcare",
  "Energy",
  "Industrials",
  "Consumer Cyclical",
  "Consumer Defensive",
  "Utilities",
  "Real Estate",
  "Basic Materials"
];

export const INDUSTRIES: Record<string, string[]> = {
  Technology: ["Software", "Hardware", "Semiconductors", "IT Services", "Cloud Computing"],
  Financials: ["Banking", "Insurance", "Asset Management", "Credit Services", "Fintech"],
  Healthcare: ["Pharmaceuticals", "Biotechnology", "Medical Devices", "Healthcare Providers", "Life Sciences"],
  Energy: ["Oil & Gas Exploration", "Refining", "Renewable Energy", "Energy Infrastructure", "Coal"],
  Industrials: ["Aerospace & Defense", "Machinery", "Railroads", "Logistics", "Electrical Equipment"],
  "Consumer Cyclical": ["Automotive", "E-Commerce", "Apparel Retail", "Home Improvement", "Hotels & Resorts"],
  "Consumer Defensive": ["Beverages", "Packaged Foods", "Household Products", "Tobacco", "Discount Stores"],
  Utilities: ["Regulated Electric", "Regulated Gas", "Water Utilities", "Independent Power Producers"],
  "Real Estate": ["REIT - Industrial", "REIT - Residential", "REIT - Office", "REIT - Retail", "Real Estate Services"],
  "Basic Materials": ["Specialty Chemicals", "Gold", "Steel", "Copper", "Agricultural Inputs"]
};

const SYMBOL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateStockList(seed: number = 42, count: number = 5000): Stock[] {
  const rng = new SeededRandom(seed);
  const stocks: Stock[] = [];

  const usedSymbols = new Set<string>();

  for (let i = 0; i < count; i++) {
    // Generate a unique symbol
    let symbol = "";
    if (i < 50) {
      // Create some familiar-looking symbols first
      const familiar = [
        "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "BRK", "JPM", "V",
        "JNJ", "WMT", "PG", "DIS", "MA", "UNH", "HD", "BAC", "PYPL", "CMCSA",
        "NFLX", "ADBE", "INTC", "CSCO", "PFE", "PEP", "KO", "T", "XOM", "MRK",
        "ABT", "ORCL", "AMD", "QCOM", "CVX", "NKE", "MCD", "DHR", "MDT", "HON",
        "TXN", "LLY", "ABBV", "AMGN", "UPS", "NEE", "VZ", "BMY", "PM", "GE"
      ];
      symbol = familiar[i];
    }

    if (!symbol || usedSymbols.has(symbol)) {
      do {
        const char1 = rng.choice(SYMBOL_ALPHABET.split(""));
        const char2 = rng.choice(SYMBOL_ALPHABET.split(""));
        const char3 = rng.choice(SYMBOL_ALPHABET.split(""));
        const char4 = rng.choice(SYMBOL_ALPHABET.split(""));
        symbol = `${char1}${char2}${char3}${char4}`;
      } while (usedSymbols.has(symbol));
    }
    usedSymbols.add(symbol);

    const sector = rng.choice(SECTORS);
    const industry = rng.choice(INDUSTRIES[sector]);
    const name = `${symbol} Corporation`;

    const price = Math.round(rng.range(5.0, 1500.0) * 100) / 100;
    const prevClose = Math.round(price * rng.range(0.95, 1.05) * 100) / 100;
    const change = Math.round((price - prevClose) * 100) / 100;
    const changePercent = Math.round((change / prevClose) * 10000) / 100;

    const volume = Math.floor(rng.range(10000, 10000000));
    const marketCap = Math.floor(rng.range(10_000_000, 3_000_000_000_000));

    const peRatio = Math.round(rng.range(5.0, 120.0) * 100) / 100;
    const pbRatio = Math.round(rng.range(0.5, 30.0) * 100) / 100;
    const dividendYield = Math.round(rng.range(0.0, 8.5) * 100) / 100;
    const debtToEquity = Math.round(rng.range(0.0, 3.5) * 100) / 100;
    const roe = Math.round(rng.range(-15.0, 45.0) * 100) / 100;
    const roce = Math.round(roe * rng.range(0.8, 1.2) * 100) / 100;
    const eps = Math.round((price / peRatio) * 100) / 100;
    const revenueGrowth = Math.round(rng.range(-10.0, 40.0) * 100) / 100;
    const profitMargin = Math.round(rng.range(-5.0, 35.0) * 100) / 100;
    const freeCashFlow = Math.floor(marketCap * rng.range(0.01, 0.08));

    const currentRatio = Math.round(rng.range(0.5, 5.0) * 100) / 100;
    const quickRatio = Math.round(currentRatio * rng.range(0.6, 0.95) * 100) / 100;
    const assetTurnover = Math.round(rng.range(0.2, 3.0) * 100) / 100;

    const beta = Math.round(rng.range(0.3, 2.2) * 100) / 100;

    const high52Week = Math.round(price * rng.range(1.02, 1.45) * 100) / 100;
    const low52Week = Math.round(price * rng.range(0.55, 0.98) * 100) / 100;

    // Technical indicator baselines
    const sma50 = Math.round(price * rng.range(0.9, 1.1) * 100) / 100;
    const sma200 = Math.round(price * rng.range(0.8, 1.2) * 100) / 100;
    const ema12 = Math.round(price * rng.range(0.95, 1.05) * 100) / 100;
    const ema26 = Math.round(price * rng.range(0.92, 1.08) * 100) / 100;
    const rsi14 = Math.round(rng.range(20.0, 80.0) * 100) / 100;
    const bollingerUpper = Math.round(price * rng.range(1.05, 1.15) * 100) / 100;
    const bollingerLower = Math.round(price * rng.range(0.85, 0.95) * 100) / 100;
    const volumeProfilePoc = Math.round(price * rng.range(0.95, 1.05) * 100) / 100;

    stocks.push({
      symbol,
      name,
      sector,
      industry,
      price,
      prevClose,
      change,
      changePercent,
      volume,
      marketCap,
      peRatio,
      pbRatio,
      dividendYield,
      debtToEquity,
      roe,
      roce,
      eps,
      revenueGrowth,
      profitMargin,
      freeCashFlow,
      currentRatio,
      quickRatio,
      assetTurnover,
      high52Week,
      low52Week,
      beta,
      sma50,
      sma200,
      ema12,
      ema26,
      rsi14,
      bollingerUpper,
      bollingerLower,
      volumeProfilePoc
    });
  }

  return stocks;
}
