// =============================
// File: AssetResponse.cs
// Description:
// Represents a simplified response model for asset-related API endpoints,
// used in tests. This model captures only essential identifying information,
// excluding sensitive or calculated fields.
// =============================

namespace App.Tests.Models
{
    public class AssetResponse
    {
        // Unique identifier of the asset (primary key)
        public int Id { get; set; }

        // Reference to the portfolio that owns this asset
        public int PortfolioId { get; set; }

        // Ticker symbol of the asset (e.g., "AAPL", "TSLA")
        public string Ticker { get; set; }

        // Display name of the asset (e.g., "Apple Inc.")
        public string Name { get; set; }
    }
}
