export interface PortfolioOverview {
  id: number;
  name: string;
  initialInvestment: number;
  currentValue: number;
  totalProfitLoss: number;
  changePercent: number;
  assetCount: number;
}
