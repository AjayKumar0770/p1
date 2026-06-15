import { describe, test, expect } from "vitest";
import { Lexer, Parser, optimizeAST, evaluateAST, stableSortStocks } from "../lib/filter/parser";
import { Stock } from "../types/index";

const mockStock1: Stock = {
  symbol: "AAPL",
  name: "Apple Inc.",
  sector: "Technology",
  industry: "Consumer Electronics",
  price: 150.00,
  prevClose: 148.00,
  change: 2.00,
  changePercent: 1.35,
  volume: 5000000,
  marketCap: 2500000000000,
  peRatio: 28.5,
  pbRatio: 35.2,
  dividendYield: 0.65,
  debtToEquity: 1.5,
  roe: 30.2,
  roce: 32.1,
  eps: 5.25,
  revenueGrowth: 8.5,
  profitMargin: 25.8,
  freeCashFlow: 80000000000,
  currentRatio: 1.2,
  quickRatio: 1.0,
  assetTurnover: 0.8,
  high52Week: 182.00,
  low52Week: 124.00,
  beta: 1.20,
  sma50: 145.00,
  sma200: 140.00,
  ema12: 148.50,
  ema26: 146.20,
  rsi14: 65.00,
  bollingerUpper: 155.00,
  bollingerLower: 135.00,
  volumeProfilePoc: 142.00
};

const mockStock2: Stock = {
  symbol: "JPM",
  name: "JPMorgan Chase",
  sector: "Financials",
  industry: "Banking",
  price: 130.00,
  prevClose: 132.00,
  change: -2.00,
  changePercent: -1.51,
  volume: 8000000,
  marketCap: 400000000000,
  peRatio: 10.5,
  pbRatio: 1.4,
  dividendYield: 3.20,
  debtToEquity: 2.8,
  roe: 12.5,
  roce: 11.2,
  eps: 12.38,
  revenueGrowth: 4.2,
  profitMargin: 18.5,
  freeCashFlow: 35000000000,
  currentRatio: 1.1,
  quickRatio: 0.9,
  assetTurnover: 0.3,
  high52Week: 145.00,
  low52Week: 108.00,
  beta: 1.05,
  sma50: 128.00,
  sma200: 125.00,
  ema12: 131.00,
  ema26: 129.50,
  rsi14: 48.00,
  bollingerUpper: 136.00,
  bollingerLower: 120.00,
  volumeProfilePoc: 122.00
};

describe("AST Filter Compiler", () => {
  test("Tokenizes simple conditions", () => {
    const lexer = new Lexer("peRatio < 15 AND sector == \"Financials\"");
    const tokens = lexer.tokenize();
    expect(tokens.length).toBe(8); // peRatio, <, 15, AND, sector, ==, "Financials", EOF
    expect(tokens[0].type).toBe("IDENTIFIER");
    expect(tokens[1].type).toBe("OP");
    expect(tokens[2].type).toBe("NUMBER");
    expect(tokens[3].type).toBe("AND");
    expect(tokens[4].type).toBe("IDENTIFIER");
    expect(tokens[5].type).toBe("OP");
    expect(tokens[6].type).toBe("STRING");
  });

  test("Parses expressions into AST and validates fields", () => {
    const parser = new Parser(new Lexer("marketCap > 100000000000 AND rsi14 <= 70").tokenize());
    const ast = parser.parse();
    expect(ast.type).toBe("AND");
    if (ast.type === "AND") {
      expect(ast.children.length).toBe(2);
      expect(ast.children[0].type).toBe("COMPARISON");
    }
  });

  test("AST evaluation works correctly on stocks", () => {
    const ast1 = new Parser(new Lexer("peRatio < 15").tokenize()).parse();
    expect(evaluateAST(ast1, mockStock1)).toBe(false); // 28.5 is not < 15
    expect(evaluateAST(ast1, mockStock2)).toBe(true);  // 10.5 is < 15

    const ast2 = new Parser(new Lexer("sector == \"Technology\" AND rsi14 > 60").tokenize()).parse();
    expect(evaluateAST(ast2, mockStock1)).toBe(true);
    expect(evaluateAST(ast2, mockStock2)).toBe(false);
  });

  test("Optimizes AST sorting by selectivity/cost", () => {
    // contains is cost 5, numeric is cost 1.
    // The optimizer should sort AND so numeric is first.
    const rawAST = new Parser(
      new Lexer("name contains \"Apple\" AND peRatio < 30").tokenize()
    ).parse();
    const optimized = optimizeAST(rawAST);

    expect(optimized.type).toBe("AND");
    if (optimized.type === "AND") {
      // First child should now be the numeric check (peRatio < 30)
      const firstChild = optimized.children[0];
      expect(firstChild.type).toBe("COMPARISON");
      if (firstChild.type === "COMPARISON") {
        expect(firstChild.field).toBe("peRatio");
      }
    }
  });

  test("Stable sorting preserves original index on equal sort keys", () => {
    const arr = [
      { ...mockStock1, sector: "Technology", symbol: "A" },
      { ...mockStock2, sector: "Technology", symbol: "B" }
    ];
    // Sort by sector descending (both are "Technology")
    // Should preserve stable order (A then B)
    const sorted = stableSortStocks(arr, [{ id: "sector", desc: false }]);
    expect(sorted[0].symbol).toBe("A");
    expect(sorted[1].symbol).toBe("B");
  });

  test("Evaluates OR and NOT conditions", () => {
    const astOr = new Parser(new Lexer("peRatio > 50 OR sector == \"Financials\"").tokenize()).parse();
    expect(evaluateAST(astOr, mockStock1)).toBe(false); // 28.5 is not > 50, sector is not Financials
    expect(evaluateAST(astOr, mockStock2)).toBe(true); // sector is Financials

    const astNot = new Parser(new Lexer("NOT (sector == \"Technology\")").tokenize()).parse();
    expect(evaluateAST(astNot, mockStock1)).toBe(false);
    expect(evaluateAST(astNot, mockStock2)).toBe(true);
  });

  test("Evaluates nested parentheses", () => {
    const ast = new Parser(new Lexer("(peRatio < 30 AND sector == \"Technology\") OR sector == \"Financials\"").tokenize()).parse();
    expect(evaluateAST(ast, mockStock1)).toBe(true); // Matches the AND
    expect(evaluateAST(ast, mockStock2)).toBe(true); // Matches the OR
  });

  test("Handles string contains and !=", () => {
    const astContains = new Parser(new Lexer("name contains \"Apple\"").tokenize()).parse();
    expect(evaluateAST(astContains, mockStock1)).toBe(true);
    expect(evaluateAST(astContains, mockStock2)).toBe(false);

    const astNotEquals = new Parser(new Lexer("name != \"Apple Inc.\"").tokenize()).parse();
    expect(evaluateAST(astNotEquals, mockStock1)).toBe(false);
    expect(evaluateAST(astNotEquals, mockStock2)).toBe(true);
  });

  test("Handles invalid inputs gracefully", () => {
    expect(() => new Parser(new Lexer("peRatio <").tokenize()).parse()).toThrow();
    expect(() => new Parser(new Lexer("(peRatio < 10").tokenize()).parse()).toThrow();
    
    const lexerError = new Lexer("@invalid");
    expect(() => lexerError.tokenize()).toThrow();
  });
});
