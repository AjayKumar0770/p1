"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketSimulator = exports.INDUSTRIES = exports.SECTORS = exports.SeededRandom = void 0;
exports.generateStockList = generateStockList;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
class SeededRandom {
    seed;
    constructor(seed) {
        this.seed = seed;
    }
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    range(min, max) {
        return min + this.next() * (max - min);
    }
    choice(arr) {
        const idx = Math.floor(this.next() * arr.length);
        return arr[idx];
    }
}
exports.SeededRandom = SeededRandom;
exports.SECTORS = [
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
exports.INDUSTRIES = {
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
function generateStockList(seed = 42, count = 5000) {
    const rng = new SeededRandom(seed);
    const stocks = [];
    const usedSymbols = new Set();
    for (let i = 0; i < count; i++) {
        let symbol = "";
        if (i < 50) {
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
        const sector = rng.choice(exports.SECTORS);
        const industry = rng.choice(exports.INDUSTRIES[sector]);
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
        const sma50 = Math.round(price * rng.range(0.9, 1.1) * 100) / 100;
        const sma200 = Math.round(price * rng.range(0.8, 1.2) * 100) / 100;
        const ema12 = Math.round(price * rng.range(0.95, 1.05) * 100) / 100;
        const ema26 = Math.round(price * rng.range(0.92, 1.08) * 100) / 100;
        const rsi14 = Math.round(rng.range(20.0, 80.0) * 100) / 100;
        const bollingerUpper = Math.round(price * rng.range(1.05, 1.15) * 100) / 100;
        const bollingerLower = Math.round(price * rng.range(0.85, 0.95) * 100) / 100;
        const volumeProfilePoc = Math.round(price * rng.range(0.95, 1.05) * 100) / 100;
        stocks.push({
            symbol, name, sector, industry, price, prevClose, change, changePercent,
            volume, marketCap, peRatio, pbRatio, dividendYield, debtToEquity, roe, roce,
            eps, revenueGrowth, profitMargin, freeCashFlow, currentRatio, quickRatio,
            assetTurnover, high52Week, low52Week, beta, sma50, sma200, ema12, ema26,
            rsi14, bollingerUpper, bollingerLower, volumeProfilePoc
        });
    }
    return stocks;
}
class MarketSimulator {
    stocks;
    stockMap;
    drifts = new Map();
    volatilities = new Map();
    betas = new Map();
    intervalId = null;
    tickIntervalMs = 1000;
    listeners = new Set();
    constructor() {
        this.stocks = generateStockList();
        this.stockMap = new Map(this.stocks.map(s => [s.symbol, s]));
        this.stocks.forEach(s => {
            const rawHash = s.symbol.charCodeAt(0) + s.symbol.charCodeAt(1) * 2 + s.symbol.charCodeAt(2) * 3;
            const drift = 0.02 + (rawHash % 13) / 100; // Annual drift: 2% to 15%
            const vol = 0.10 + (rawHash % 41) / 100; // Annual volatility: 10% to 50%
            this.drifts.set(s.symbol, drift);
            this.volatilities.set(s.symbol, vol);
            this.betas.set(s.symbol, s.beta);
        });
    }
    getGaussianNoise() {
        let u1 = 0;
        let u2 = 0;
        while (u1 === 0)
            u1 = Math.random();
        while (u2 === 0)
            u2 = Math.random();
        return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    }
    tick() {
        const dt = 1 / 252; // daily equivalence
        const updates = [];
        const epsilonGlobal = this.getGaussianNoise();
        const sectorShocks = {};
        const sectorCorrelation = 0.4;
        exports.SECTORS.forEach(sector => {
            const epsilonSectorIdiosyncratic = this.getGaussianNoise();
            sectorShocks[sector] =
                sectorCorrelation * epsilonGlobal +
                    Math.sqrt(1 - sectorCorrelation * sectorCorrelation) * epsilonSectorIdiosyncratic;
        });
        this.stocks.forEach(stock => {
            const mu = this.drifts.get(stock.symbol) || 0.05;
            const sigma = this.volatilities.get(stock.symbol) || 0.20;
            const beta = this.betas.get(stock.symbol) || 1.0;
            const epsilonStockIdiosyncratic = this.getGaussianNoise();
            const stockSectorCorrelation = Math.min(Math.max(beta * 0.4, 0.1), 0.9);
            const epsilonStock = stockSectorCorrelation * sectorShocks[stock.sector] +
                Math.sqrt(1 - stockSectorCorrelation * stockSectorCorrelation) * epsilonStockIdiosyncratic;
            // dS = S * (mu * dt + sigma * epsilon * sqrt(dt))
            const priceChangeFactor = mu * dt + sigma * epsilonStock * Math.sqrt(dt);
            const oldPrice = stock.price;
            let newPrice = oldPrice * (1 + priceChangeFactor);
            if (newPrice < 1.0)
                newPrice = 1.0;
            newPrice = Math.round(newPrice * 100) / 100;
            const volumeDelta = Math.floor((Math.random() - 0.5) * 0.05 * stock.volume);
            let newVolume = stock.volume + volumeDelta;
            if (newVolume < 1000)
                newVolume = 1000;
            const change = Math.round((newPrice - stock.prevClose) * 100) / 100;
            const changePercent = Math.round((change / stock.prevClose) * 10000) / 100;
            stock.price = newPrice;
            stock.volume = newVolume;
            stock.change = change;
            stock.changePercent = changePercent;
            if (newPrice > stock.high52Week)
                stock.high52Week = newPrice;
            if (newPrice < stock.low52Week)
                stock.low52Week = newPrice;
            updates.push({
                symbol: stock.symbol,
                price: newPrice,
                change,
                changePercent,
                volume: newVolume
            });
        });
        this.listeners.forEach(listener => listener(updates));
    }
    start() {
        if (this.intervalId)
            return;
        this.intervalId = setInterval(() => this.tick(), this.tickIntervalMs);
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    addListener(listener) {
        this.listeners.add(listener);
    }
    removeListener(listener) {
        this.listeners.delete(listener);
    }
    getStocks() {
        return this.stocks;
    }
    getStock(symbol) {
        return this.stockMap.get(symbol);
    }
    getHistory(symbol) {
        const stock = this.getStock(symbol);
        if (!stock)
            return [];
        let seed = 0;
        for (let idx = 0; idx < symbol.length; idx++) {
            seed += symbol.charCodeAt(idx) * Math.pow(10, idx);
        }
        const rng = new SeededRandom(seed);
        const history = [];
        let currentPrice = stock.price * 0.7;
        let currentVolume = stock.volume;
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() - 252);
        for (let i = 0; i < 252; i++) {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + i);
            const dateString = date.toISOString().split("T")[0];
            const dailyDrift = 0.0005;
            const dailyVol = 0.015;
            let u1 = 0;
            let u2 = 0;
            while (u1 === 0)
                u1 = rng.next();
            while (u2 === 0)
                u2 = rng.next();
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
        if (history.length > 0) {
            history[history.length - 1].close = stock.price;
        }
        return history;
    }
    getFundamentals(symbol) {
        const stock = this.getStock(symbol);
        if (!stock)
            return null;
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
exports.MarketSimulator = MarketSimulator;
// ==========================================
// 3. REST & WEBSOCKET ENGINE HUB
// ==========================================
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const simulator = new MarketSimulator();
simulator.start();
app.get("/api/stocks", (req, res) => {
    try {
        const stocks = simulator.getStocks();
        res.json(stocks);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve stock list" });
    }
});
app.get("/api/stocks/:symbol/history", (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const history = simulator.getHistory(symbol);
        if (history.length === 0) {
            res.status(404).json({ error: `Stock ${symbol} not found` });
            return;
        }
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve historical data" });
    }
});
app.get("/api/stocks/:symbol/fundamentals", (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const fundamentals = simulator.getFundamentals(symbol);
        if (!fundamentals) {
            res.status(404).json({ error: `Stock ${symbol} not found` });
            return;
        }
        res.json(fundamentals);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve fundamentals data" });
    }
});
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const sessions = new Set();
wss.on("connection", (ws) => {
    const session = {
        ws,
        subscriptions: new Set()
    };
    sessions.add(session);
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === "subscribe" && data.channel) {
                const match = data.channel.match(/^subscribe:price:([A-Z0-9]+)$/i);
                if (match) {
                    const symbol = match[1].toUpperCase();
                    session.subscriptions.add(symbol);
                    ws.send(JSON.stringify({ type: "subscribed", channel: data.channel }));
                }
            }
            else if (data.type === "unsubscribe" && data.channel) {
                const match = data.channel.match(/^unsubscribe:price:([A-Z0-9]+)$/i);
                if (match) {
                    const symbol = match[1].toUpperCase();
                    session.subscriptions.delete(symbol);
                    ws.send(JSON.stringify({ type: "unsubscribed", channel: data.channel }));
                }
            }
        }
        catch (e) {
            ws.send(JSON.stringify({ error: "Invalid message format" }));
        }
    });
    ws.on("close", () => {
        sessions.delete(session);
    });
});
simulator.addListener((updates) => {
    sessions.forEach((session) => {
        if (session.ws.readyState !== ws_1.WebSocket.OPEN)
            return;
        const clientUpdates = updates.filter(update => session.subscriptions.has(update.symbol));
        if (clientUpdates.length > 0) {
            session.ws.send(JSON.stringify({
                type: "ticks",
                data: clientUpdates
            }));
        }
    });
});
server.listen(port, () => {
    console.log(`Simulation Engine Server listening on port ${port}`);
});
