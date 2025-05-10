namespace App.Tests.Models
{
    /* Summary
    Represents the structure of a watchlist item returned from the API,
    used specifically in integration tests to deserialize and validate responses.
    */

    public class WatchlistResponse
    {
        /// Unique identifier of the watchlist item.
        public int Id { get; set; }

        /// The stock ticker symbol, e.g. "AAPL", "GOOGL".
        public string Ticker { get; set; }

        /// The readable name of the asset, e.g. "Apple Inc.".
        public string AssetName { get; set; }

        /// The target price set by the user for tracking.
        public decimal TargetPrice { get; set; }
    }
}
