// =============================
// File: Watchlist.cs
// Description:
// Represents an entry in a user's personal watchlist for financial instruments.
// Used to track assets the user is interested in and optionally set a target price for monitoring.
// =============================

namespace App.Model.Entities
{
    public class Watchlist
    {
        public Watchlist() { }

        // Constructor to initialize with a specific ID (used for updates or references)
        public Watchlist(int id)
        {
            Id = id;
        }

        // Unique identifier of the watchlist entry
        public int Id { get; set; }

        // Foreign key to the user who owns this watchlist entry
        public int UserId { get; set; }

        // Ticker symbol of the asset to watch (e.g. "AAPL", "BTC-USD")
        public string Ticker { get; set; }

        // Human-readable name of the asset (e.g. "Apple", "Bitcoin")
        public string AssetName { get; set; } = null!;

        // User-defined target price at which they may want to take action (e.g. buy/ sell/ alert)
        public decimal TargetPrice { get; set; }
    }
}
