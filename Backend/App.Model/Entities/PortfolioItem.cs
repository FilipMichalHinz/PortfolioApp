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

        public int AssetTypeId { get; set; }

        public string Ticker { get; set; } // Example: "TSLA", "AAPL", "GOOGL"

        public decimal PurchasePrice { get; set; }

        public decimal Quantity { get; set; }

        public DateTime PurchaseDate { get; set; }
    }
}
