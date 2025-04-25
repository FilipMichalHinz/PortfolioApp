export interface AssetPerformance {
  ticker: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  initialInvestment: number;
  currentValue: number;
  profitLoss: number;
  changePercent: number;
}

export interface PortfolioSummary {
  portfolioId: number;
  initialInvestment: number;
  currentValue: number;
  totalProfitLoss: number;
  changePercent: number;
  byAsset: AssetPerformance[];
}
