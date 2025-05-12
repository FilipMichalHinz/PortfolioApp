// =============================
// File: Portfolio.cs
// Description:
// Represents a user's investment portfolio, which groups together multiple assets under a named entity.
// Used to logically separate and manage asset collections, and to track ownership.
// =============================

namespace App.Model.Entities
{
    public class Portfolio
    {
        public Portfolio() {}

        // Constructor to initialize a portfolio with a specific ID (used for updates or lookups)
        public Portfolio(int id)
        {
            Id = id;
        }

        // Unique identifier of the portfolio
        public int Id { get; set; }

        // Human-readable name of the portfolio (e.g. "Retirement Fund", "Tech Stocks")
        public string Name { get; set; }

        // Foreign key reference to the user who owns this portfolio
        public int UserId { get; set; }

        // Timestamp of when the portfolio was created (defaulted to current time)
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
