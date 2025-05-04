namespace App.Model.Entities
{
    public class PortfolioItem
    {
        public PortfolioItem() { }

        public PortfolioItem(int id)
        {
            Id = id;
        }

        public int Id { get; set; }

        public int PortfolioId { get; set; }

        // public int Id { get; set; }

        public string Name { get; set; } // Example: "Tesla", "Apple", "Google"

        public string Ticker { get; set; } // Example: "TSLA", "AAPL", "GOOGL"

        public decimal PurchasePrice { get; set; }

        public decimal Quantity { get; set; }

        public DateTime PurchaseDate { get; set; }

        // Price at which the asset was sold (if sold)
        public decimal? ExitPrice { get; set; }
        // Date when the asset was sold
        public DateTime? ExitDate { get; set; }
        // Whether the asset has been sold
        public bool IsSold { get; set; } = false;
    }
}
