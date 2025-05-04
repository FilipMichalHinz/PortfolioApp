export interface PortfolioItem {
  id: number;
  portfolioId: number;
  
  name: string;
  purchasePrice: number;
  quantity: number;
  purchaseDate: string;
  ticker: string;
  exitPrice?: number;
  exitDate?: string;
  IsSold?: boolean;
}
