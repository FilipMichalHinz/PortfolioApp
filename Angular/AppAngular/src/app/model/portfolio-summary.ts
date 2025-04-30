export interface AssetPerformance {
  id: number;
  ticker: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  initialInvestment: number;
  currentValue: number;
  profitLoss: number;
  changePercent: number;
  exitPrice?: number;
  exitDate?: string;
  isSold?: boolean;
}

export interface PortfolioSummary {
  portfolioId: number;
  initialInvestment: number;
  currentValue: number;
  totalProfitLoss: number;
  changePercent: number;
  byAsset: AssetPerformance[];
}
