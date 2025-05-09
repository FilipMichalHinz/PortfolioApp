namespace App.Model.Entities
{
    public class Watchlist
    {
        public Watchlist() { }

        public Watchlist(int id)
        {
            Id = id;
        }

        public int Id { get; set; }

        public int UserId { get; set; }

        public string Ticker { get; set; } // Example: "AAPL", "BTC-USD"

        public string AssetName { get; set; } = null!; // Example: "Tesla", "Bitcoin"

        public decimal TargetPrice { get; set; }  // Price at which the user wants to be notified

       
    }
}
