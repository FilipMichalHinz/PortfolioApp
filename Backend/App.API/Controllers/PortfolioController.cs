// =============================
// File: PortfolioController.cs
// Description:
// Provides authenticated CRUD endpoints for managing user portfolios.
// Includes advanced aggregation logic to compute current portfolio value and performance metrics,
// using real-time market prices from Yahoo Finance.
// =============================

using App.Model.Entities;
using App.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using YahooFinanceApi;

namespace App.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PortfolioController : ControllerBase
    {
        private readonly PortfolioRepository _portfolioRepo;
        private readonly AssetRepository _itemRepo;

        // Constructor injection of repositories
        public PortfolioController(
            PortfolioRepository portfolioRepo,
            AssetRepository itemRepo)
        {
            _portfolioRepo = portfolioRepo;
            _itemRepo = itemRepo;
        }

        // Retrieves authenticated user ID from HTTP context
        private int GetAuthenticatedUserId()
        {
            if (HttpContext.Items.TryGetValue("UserId", out var userIdObj) && userIdObj is int userId)
                return userId;

            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        // GET /api/portfolio/{id}
        // Returns a specific portfolio if it belongs to the authenticated user
        [HttpGet("{id}")]
        public ActionResult<Portfolio> GetPortfolio([FromRoute] int id)
        {
            int userId = GetAuthenticatedUserId();
            var portfolio = _portfolioRepo.GetPortfolioById(id, userId);
            return portfolio == null ? NotFound() : Ok(portfolio);
        }

        // GET /api/portfolio
        // Returns all portfolios owned by the authenticated user
        [HttpGet]
        public ActionResult<IEnumerable<Portfolio>> GetPortfolios()
        {
            int userId = GetAuthenticatedUserId();
            var list = _portfolioRepo.GetPortfoliosByUser(userId);
            return Ok(list);
        }

        // GET /api/portfolio/overview
        // Returns summaries for each portfolio, including market-based performance metrics
        [HttpGet("overview")]
        public async Task<ActionResult<IEnumerable<PortfolioOverview>>> GetOverviews()
        {
            int userId = GetAuthenticatedUserId();
            var portfolios = _portfolioRepo.GetPortfoliosByUser(userId).ToList();
            var overviews = new List<PortfolioOverview>(portfolios.Count);

            foreach (var p in portfolios)
            {
                var items = _itemRepo.GetByPortfolio(p.Id);

                // Handle empty portfolios
                if (items == null || items.Count == 0)
                {
                    overviews.Add(new PortfolioOverview
                    {
                        Id = p.Id,
                        Name = p.Name,
                        InitialInvestment = 0,
                        CurrentValue = 0,
                        TotalProfitLoss = 0,
                        ChangePercent = 0,
                        AssetCount = 0
                    });
                    continue;
                }

                // Collect distinct tickers for price query
                var tickers = items
                    .Select(i => i.Ticker)
                    .Where(t => !string.IsNullOrWhiteSpace(t))
                    .Distinct()
                    .ToArray();

                decimal totalCost = 0m;
                decimal totalValue = 0m;

                if (tickers.Length > 0)
                {
                    try
                    {
                        // Fetch current market prices from Yahoo Finance
                        var priceData = await Yahoo
                            .Symbols(tickers)
                            .Fields(Field.RegularMarketPrice)
                            .QueryAsync();

                        foreach (var itm in items)
                        {
                            // Accumulate cost based on purchase price
                            var cost = itm.PurchasePrice * itm.Quantity;
                            totalCost += cost;

                            // Accumulate current value based on real-time price
                            if (priceData.ContainsKey(itm.Ticker))
                            {
                                var security = priceData[itm.Ticker];
                                decimal currentPrice = (decimal)security.RegularMarketPrice;
                                totalValue += currentPrice * itm.Quantity;
                            }
                        }
                    }
                    catch (Exception)
                    {
                        // Swallow exception silently for price fetching issues
                        // (could be improved with logging)
                    }
                }

                // Calculate profit/loss and percentage change
                var profitLoss = totalValue - totalCost;
                var changePct = totalCost == 0
                    ? 0
                    : Math.Round((profitLoss / totalCost) * 100, 2);

                // Construct summary object
                overviews.Add(new PortfolioOverview
                {
                    Id = p.Id,
                    Name = p.Name,
                    InitialInvestment = totalCost,
                    CurrentValue = totalValue,
                    TotalProfitLoss = profitLoss,
                    ChangePercent = changePct,
                    AssetCount = items.Count
                });
            }

            return Ok(overviews);
        }

        // POST /api/portfolio
        // Creates a new portfolio for the authenticated user
        [HttpPost]
        public ActionResult<Portfolio> Post([FromBody] Portfolio portfolio)
        {
            if (portfolio == null)
                return BadRequest("Portfolio info not correct");

            portfolio.UserId = GetAuthenticatedUserId();

            var success = _portfolioRepo.InsertPortfolio(portfolio);
            return success ? Ok(portfolio) : BadRequest("Unable to insert portfolio");
        }

        // PUT /api/portfolio
        // Updates an existing portfolio
        [HttpPut]
        public ActionResult UpdatePortfolio([FromBody] Portfolio portfolio)
        {
            if (portfolio == null)
                return BadRequest("Portfolio info not correct");

            var userId = GetAuthenticatedUserId();
            var existing = _portfolioRepo.GetPortfolioById(portfolio.Id, userId);
            if (existing == null)
                return NotFound($"Portfolio with id {portfolio.Id} not found");

            portfolio.UserId = userId;
            var success = _portfolioRepo.UpdatePortfolio(portfolio);
            return success ? Ok() : BadRequest("Something went wrong");
        }

        // DELETE /api/portfolio/{id}
        // Deletes a portfolio owned by the authenticated user
        [HttpDelete("{id}")]
        public ActionResult DeletePortfolio([FromRoute] int id)
        {
            var userId = GetAuthenticatedUserId();
            var existing = _portfolioRepo.GetPortfolioById(id, userId);
            if (existing == null)
                return NotFound($"Portfolio with id {id} not found");

            var success = _portfolioRepo.DeletePortfolio(id);
            return success ? NoContent() : BadRequest($"Unable to delete Portfolio with id {id}");
        }
    }
}
