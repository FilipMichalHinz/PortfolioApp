// =============================
// File: PortfolioOverview.cs
// Description:
// Represents a summarized view of a portfolio's performance. Unlike the main Portfolio entity,
// this class is not mapped to a database table — it is used to present aggregated runtime data,
// such as calculated values from current market prices and user asset holdings.
// =============================

namespace App.Model.Entities
{
    public class PortfolioOverview
    {
        // ID of the portfolio this overview belongs to
        public int Id { get; set; }

        // Display name of the portfolio
        public string Name { get; set; }

        // Total amount originally invested across all assets in this portfolio
        public decimal InitialInvestment { get; set; }

        // Total current market value of the portfolio, based on live prices
        public decimal CurrentValue { get; set; }

        // Absolute profit or loss (CurrentValue - InitialInvestment)
        public decimal TotalProfitLoss { get; set; }

        // Percentage gain/loss relative to the initial investment
        public decimal ChangePercent { get; set; }

        // Number of individual assets held in the portfolio
        public int AssetCount { get; set; }
    }
}
