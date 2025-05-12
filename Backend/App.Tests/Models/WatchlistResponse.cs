// =============================
// File: WatchlistResponse.cs
// Description:
// Represents the structure of a watchlist item as returned by the API.
// Used in integration tests to deserialize and assert correct response data.
// =============================

namespace App.Tests.Models
{
    public class WatchlistResponse
    {
        // Unique identifier of the watchlist item
        public int Id { get; set; }

        // Stock ticker symbol (e.g. "AAPL", "GOOGL")
        public string Ticker { get; set; }

        // Human-readable name of the asset (e.g. "Apple Inc.")
        public string AssetName { get; set; }

        // User-defined target price used for alerting or monitoring
        public decimal TargetPrice { get; set; }
    }
}
