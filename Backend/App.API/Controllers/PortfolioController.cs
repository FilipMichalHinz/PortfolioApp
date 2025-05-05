using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Model.Entities;
using App.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using YahooFinanceApi;

namespace App.API.Controllers
{
    // API route: api/portfolio
    [Route("api/[controller]")]
    [ApiController]
    public class PortfolioController : ControllerBase
    {
        // Repository for portfolio metadata (e.g., name, creation date)
        private readonly PortfolioRepository _portfolioRepo;

        // Repository for associated portfolio items (assets)
        private readonly PortfolioItemRepository _itemRepo;

        public PortfolioController(
            PortfolioRepository portfolioRepo,
            PortfolioItemRepository itemRepo)
        {
            _portfolioRepo = portfolioRepo;
            _itemRepo      = itemRepo;
        }

        // GET: api/portfolio/{id}
        // Retrieves a single portfolio by its ID
        [HttpGet("{id}")]
        public ActionResult<Portfolio> GetPortfolio([FromRoute] int id)
        {
            var portfolio = _portfolioRepo.GetPortfolioById(id);
            if (portfolio == null)
                return NotFound();

            return Ok(portfolio);
        }

        // GET: api/portfolio
        // Returns all portfolios (basic data, no calculated values)
        [HttpGet]
        public ActionResult<IEnumerable<Portfolio>> GetPortfolios()
        {
            var list = _portfolioRepo.GetPortfolios();
            return Ok(list);
        }

        // GET: api/portfolio/overview
        // Returns an overview of each portfolio including current value from Yahoo Finance
        [HttpGet("overview")]
        public async Task<ActionResult<IEnumerable<PortfolioOverview>>> GetOverviews()
        {
            // 1. Load all portfolios from the database
            var portfolios = _portfolioRepo.GetPortfolios().ToList();
            var overviews  = new List<PortfolioOverview>(portfolios.Count);

            foreach (var p in portfolios)
            {
                // 2. Load all items (holdings) in the current portfolio
                var items = _itemRepo.getByPortfolio(p.Id);

                // 3. If portfolio is empty, return an overview with zeroed values
                if (items == null || items.Count == 0)
                {
                    overviews.Add(new PortfolioOverview {
                        Id                = p.Id,
                        PortfolioName     = p.PortfolioName,
                        InitialInvestment = 0,
                        CurrentValue      = 0,
                        TotalProfitLoss   = 0,
                        ChangePercent     = 0,
                        AssetCount        = 0
                    });
                    continue;
                }

                // 4. Extract distinct non-empty tickers
                var tickers = items
                    .Select(i => i.Ticker)
                    .Where(t => !string.IsNullOrWhiteSpace(t))
                    .Distinct()
                    .ToArray();

                decimal totalCost  = 0m;
                decimal totalValue = 0m;

                // 5. Query live prices from Yahoo Finance (if tickers exist)
                if (tickers.Length > 0)
                {
                    try
                    {
                        var priceData = await Yahoo
                            .Symbols(tickers)
                            .Fields(Field.RegularMarketPrice)
                            .QueryAsync();

                        foreach (var itm in items)
                        {
                            // Compute the invested amount for this item
                            var cost = itm.PurchasePrice * itm.Quantity;
                            totalCost += cost;

                            // Safely retrieve current market price
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
                        // Optional: log the failure to fetch prices
                        // e.g. _logger.LogWarning(ex, "Yahoo Finance call failed");
                    }
                }

                // 6. Calculate profit/loss and percentage change
                var profitLoss = totalValue - totalCost;
                var changePct = totalCost == 0
                              ? 0
                              : Math.Round((profitLoss / totalCost) * 100, 2);

                // 7. Add the computed overview to the response list
                overviews.Add(new PortfolioOverview {
                    Id                = p.Id,
                    PortfolioName     = p.PortfolioName,
                    InitialInvestment = totalCost,
                    CurrentValue      = totalValue,
                    TotalProfitLoss   = profitLoss,
                    ChangePercent     = changePct,
                    AssetCount        = items.Count
                });
            }

            return Ok(overviews);
        }

        // POST: api/portfolio
        // Creates a new portfolio entry
        [HttpPost]
        public ActionResult<Portfolio> Post([FromBody] Portfolio portfolio)
        {
            if (portfolio == null)
                return BadRequest("Portfolio info not correct");

            var success = _portfolioRepo.InsertPortfolio(portfolio);
            if (success)
                return Ok(portfolio);

            return BadRequest("Unable to insert portfolio");
        }

        // PUT: api/portfolio
        // Updates an existing portfolio
        [HttpPut]
        public ActionResult UpdatePortfolio([FromBody] Portfolio portfolio)
        {
            if (portfolio == null)
                return BadRequest("Portfolio info not correct");

            var existing = _portfolioRepo.GetPortfolioById(portfolio.Id);
            if (existing == null)
                return NotFound($"Portfolio with id {portfolio.Id} not found");

            var success = _portfolioRepo.UpdatePortfolio(portfolio);
            if (success)
                return Ok();

            return BadRequest("Something went wrong");
        }

        // DELETE: api/portfolio/{id}
        // Deletes a portfolio by its ID
        [HttpDelete("{id}")]
        public ActionResult DeletePortfolio([FromRoute] int id)
        {
            var existing = _portfolioRepo.GetPortfolioById(id);
            if (existing == null)
                return NotFound($"Portfolio with id {id} not found");

            var success = _portfolioRepo.DeletePortfolio(id);
            if (success)
                return NoContent();

            return BadRequest($"Unable to delete Portfolio with id {id}");
        }
    }
}
