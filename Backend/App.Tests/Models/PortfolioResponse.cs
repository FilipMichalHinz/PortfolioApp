// =============================
// File: PortfolioResponse.cs
// Description:
// Represents the expected structure of a portfolio object returned by the API.
// Used in integration tests to deserialize and validate portfolio creation, retrieval, and deletion.
// =============================

namespace App.Tests.Models
{
    public class PortfolioResponse
    {
        // Unique identifier of the portfolio
        public int Id { get; set; }

        // Name of the portfolio (e.g. "Tech Growth", "Retirement Fund")
        public string Name { get; set; }

        // Identifier of the user who owns the portfolio
        public int UserId { get; set; }

        // Timestamp indicating when the portfolio was created
        public DateTime CreatedAt { get; set; }
    }
}
