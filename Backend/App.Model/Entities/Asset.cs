// =============================
// File: Asset.cs
// Description:
// Represents a financial asset (e.g. stock, ETF) within a user's portfolio.
// Stores key investment data such as ticker, purchase price, quantity, and sale details (if applicable).
// =============================

namespace App.Model.Entities
{
    public class Asset
    {
        public Asset() { }

        // Convenience constructor to initialize with an ID
        public Asset(int id)
        {
            Id = id;
        }

        // Unique identifier of the asset
        public int Id { get; set; }

        // Foreign key to the owning portfolio
        public int PortfolioId { get; set; }

        // Full name of the asset (e.g. "Tesla", "Apple")
        public string Name { get; set; }

        // Stock ticker symbol (e.g., "TSLA", "AAPL")
        public string Ticker { get; set; }

        // Price at which the asset was originally purchased
        public decimal PurchasePrice { get; set; }

        // Number of shares or units purchased
        public decimal Quantity { get; set; }

        // Date of purchase
        public DateTime PurchaseDate { get; set; }

        // Optional: Price at which the asset was sold (null if not sold)
        public decimal? ExitPrice { get; set; }

        // Optional: Date when the asset was sold (null if not sold)
        public DateTime? ExitDate { get; set; }

        // Indicates whether the asset has been sold
        public bool IsSold { get; set; } = false;
    }
}
