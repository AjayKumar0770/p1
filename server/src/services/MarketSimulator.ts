import { Stock, generateStockList, SECTORS, SeededRandom } from "../data/seed.js";

export interface TickUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export class MarketSimulator {
  private stocks: Stock[];
  private stockMap: Map<string, Stock>;
  private drifts: Map<string, number> = new Map();
  private volatilities: Map<string, number> = new Map();
  private betas: Map<string, number> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private tickIntervalMs = 1000;
  private listeners: Set<(updates: TickUpdate[]) => void> = new Set();

  constructor() {
    this.stocks = generateStockList();
    this.stockMap = new Map(this.stocks.map(s => [s.symbol, s]));

    // Initialize drift and volatility for each stock deterministically
    this.stocks.forEach(s => {
      // Annual drift: 2% to 15%
      const rawHash = s.symbol.charCodeAt(0) + s.symbol.charCodeAt(1) * 2 + s.symbol.charCodeAt(2) * 3;
      const drift = 0.02 + (rawHash % 13) / 100;
      // Annual volatility: 10% to 50%
      const vol = 0.10 + (rawHash % 41) / 100;
      this.drifts.set(s.symbol, drift);
      this.volatilities.set(s.symbol, vol);
      this.betas.set(s.symbol, s.beta);
    });
  }

  // Box-Muller transform to generate a standard normal variable N(0, 1)
  private getGaussianNoise(): number {
    let u1 = 0;
    let u2 = 0;
    while (u1 === 0) u1 = Math.random(); // Must be in (0, 1]
    while (u2 === 0) u2 = Math.random();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }

  // Run a single update step for all stocks
  public tick() {
    const dt = 1 / 252; // daily-equivalent step sizing for visible updates
    const updates: TickUpdate[] = [];

    // 1. Generate macroeconomic/global shock factor
    const epsilonGlobal = this.getGaussianNoise();

    // 2. Generate sector shock factors
    const sectorShocks: Record<string, number> = {};
    const sectorCorrelation = 0.4; // Sector correlation to overall market
    
    SECTORS.forEach(sector => {
      const epsilonSectorIdiosyncratic = this.getGaussianNoise();
      // Sector shock combining global and sector-idiosyncratic
      sectorShocks[sector] = 
        sectorCorrelation * epsilonGlobal + 
        Math.sqrt(1 - sectorCorrelation * sectorCorrelation) * epsilonSectorIdiosyncratic;
    });

    // 3. Update each stock
    this.stocks.forEach(stock => {
      const mu = this.drifts.get(stock.symbol) || 0.05;
      const sigma = this.volatilities.get(stock.symbol) || 0.20;
      const beta = this.betas.get(stock.symbol) || 1.0;

      // Stock idiosyncratic shock
      const epsilonStockIdiosyncratic = this.getGaussianNoise();

      // Sector correlation factor based on stock beta
      const stockSectorCorrelation = Math.min(Math.max(beta * 0.4, 0.1), 0.9);

      // Stock shock combining sector shock and idiosyncratic shock
      const epsilonStock = 
        stockSectorCorrelation * sectorShocks[stock.sector] + 
        Math.sqrt(1 - stockSectorCorrelation * stockSectorCorrelation) * epsilonStockIdiosyncratic;

      // Geometric Brownian Motion formula
      // dS = S * (mu * dt + sigma * epsilon * sqrt(dt))
      const priceChangeFactor = mu * dt + sigma * epsilonStock * Math.sqrt(dt);
      const oldPrice = stock.price;
      let newPrice = oldPrice * (1 + priceChangeFactor);

      // Bound price so stocks don't go to zero or negative
      if (newPrice < 1.0) newPrice = 1.0;
      newPrice = Math.round(newPrice * 100) / 100;

      // Update volume with random noise
      const volumeDelta = Math.floor((Math.random() - 0.5) * 0.05 * stock.volume);
      let newVolume = stock.volume + volumeDelta;
      if (newVolume < 1000) newVolume = 1000;

      // Calculate new metrics
      const change = Math.round((newPrice - stock.prevClose) * 100) / 100;
      const changePercent = Math.round((change / stock.prevClose) * 10000) / 100;

      // Update stock object in memory
      stock.price = newPrice;
      stock.volume = newVolume;
      stock.change = change;
      stock.changePercent = changePercent;
      
      // Keep track of 52-week extremes
      if (newPrice > stock.high52Week) stock.high52Week = newPrice;
      if (newPrice < stock.low52Week) stock.low52Week = newPrice;

      updates.push({
        symbol: stock.symbol,
        price: newPrice,
        change,
        changePercent,
        volume: newVolume
      });
    });

    // Notify listeners
    this.listeners.forEach(listener => listener(updates));
  }

  public start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), this.tickIntervalMs);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public addListener(listener: (updates: TickUpdate[]) => void) {
    this.listeners.add(listener);
  }

  public removeListener(listener: (updates: TickUpdate[]) => void) {
    this.listeners.delete(listener);
  }

  public getStocks(): Stock[] {
    return this.stocks;
  }

  public getStock(symbol: string): Stock | undefined {
    return this.stockMap.get(symbol);
  }

  // Generates 252-day history deterministically using the stock's symbol and fundamentals as seed
  public getHistory(symbol: string): { time: string; open: number; high: number; low: number; close: number; volume: number }[] {
    const stock = this.getStock(symbol);
    if (!stock) return [];

    // Build a deterministic seed using the symbol chars
    let seed = 0;
    for (let idx = 0; idx < symbol.length; idx++) {
      seed += symbol.charCodeAt(idx) * Math.pow(10, idx);
    }
    
    // Set up a deterministic random number generator
    const rng = new SeededRandom(seed);
    const history: { time: string; open: number; high: number; low: number; close: number; volume: number }[] = [];
    
    let currentPrice = stock.price * 0.7; // Start history at roughly 70% of current price
    let currentVolume = stock.volume;

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 252);

    for (let i = 0; i < 252; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      
      // format: YYYY-MM-DD
      const dateString = date.toISOString().split("T")[0];

      // Generate daily price change using GBM-like model
      const dailyDrift = 0.0005; 
      const dailyVol = 0.015;
      
      // Box-Muller on the deterministic rng
      let u1 = 0;
      let u2 = 0;
      while (u1 === 0) u1 = rng.next();
      while (u2 === 0) u2 = rng.next();
      const epsilon = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

      const pctChange = dailyDrift + dailyVol * epsilon;
      const open = Math.round(currentPrice * 100) / 100;
      const close = Math.round(currentPrice * (1 + pctChange) * 100) / 100;
      
      const dayHigh = Math.round(Math.max(open, close) * (1 + rng.next() * 0.02) * 100) / 100;
      const dayLow = Math.round(Math.min(open, close) * (1 - rng.next() * 0.02) * 100) / 100;
      
      const volNoise = Math.floor((rng.next() - 0.5) * 0.2 * currentVolume);
      const dayVolume = Math.max(1000, currentVolume + volNoise);

      history.push({
        time: dateString,
        open,
        high: dayHigh,
        low: dayLow,
        close,
        volume: dayVolume
      });

      currentPrice = close;
    }

    // Force the final day close to match current live price
    if (history.length > 0) {
      history[history.length - 1].close = stock.price;
    }

    return history;
  }

  // Generates financial sheets and accounting ratios
  public getFundamentals(symbol: string) {
    const stock = this.getStock(symbol);
    if (!stock) return null;

    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      industry: stock.industry,
      ratios: {
        peRatio: stock.peRatio,
        pbRatio: stock.pbRatio,
        dividendYield: stock.dividendYield,
        debtToEquity: stock.debtToEquity,
        roe: stock.roe,
        roce: stock.roce,
        eps: stock.eps,
        revenueGrowth: stock.revenueGrowth,
        profitMargin: stock.profitMargin,
        currentRatio: stock.currentRatio,
        quickRatio: stock.quickRatio,
        assetTurnover: stock.assetTurnover,
        beta: stock.beta
      },
      incomeStatement: [
        { year: "2025", revenue: stock.freeCashFlow * 15, grossProfit: stock.freeCashFlow * 6, netIncome: stock.freeCashFlow * 2 },
        { year: "2024", revenue: stock.freeCashFlow * 13, grossProfit: stock.freeCashFlow * 5, netIncome: stock.freeCashFlow * 1.7 },
        { year: "2023", revenue: stock.freeCashFlow * 11, grossProfit: stock.freeCashFlow * 4.2, netIncome: stock.freeCashFlow * 1.3 }
      ],
      balanceSheet: [
        { year: "2025", totalAssets: stock.marketCap * 0.4, totalLiabilities: stock.marketCap * 0.4 * (stock.debtToEquity / (1 + stock.debtToEquity)), equity: stock.marketCap * 0.4 * (1 / (1 + stock.debtToEquity)) },
        { year: "2024", totalAssets: stock.marketCap * 0.35, totalLiabilities: stock.marketCap * 0.35 * (stock.debtToEquity / (1 + stock.debtToEquity)), equity: stock.marketCap * 0.35 * (1 / (1 + stock.debtToEquity)) },
        { year: "2023", totalAssets: stock.marketCap * 0.3, totalLiabilities: stock.marketCap * 0.3 * (stock.debtToEquity / (1 + stock.debtToEquity)), equity: stock.marketCap * 0.3 * (1 / (1 + stock.debtToEquity)) }
      ]
    };
  }
}
