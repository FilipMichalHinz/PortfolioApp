

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
    [Route("api/[controller]")]
    [ApiController]
    public class PortfolioController : ControllerBase
    {
        // Repository for basic CRUD on Portfolio table
        private readonly PortfolioRepository _portfolioRepo;

        // Repository for fetching portfolio items (holdings)
        private readonly PortfolioItemRepository _itemRepo;

        public PortfolioController(
            PortfolioRepository portfolioRepo,
            PortfolioItemRepository itemRepo)
        {
            _portfolioRepo = portfolioRepo;
            _itemRepo      = itemRepo;
        }

        
        [HttpGet("{id}")]
        public ActionResult<Portfolio> GetPortfolio([FromRoute] int id)
        {
            var portfolio = _portfolioRepo.GetPortfolioById(id);
            if (portfolio == null)
                return NotFound();

            return Ok(portfolio);
        }

       
        // Returns the raw portfolios (no computed fields)
        [HttpGet]
        public ActionResult<IEnumerable<Portfolio>> GetPortfolios()
        {
            var list = _portfolioRepo.GetPortfolios();
            return Ok(list);
        }

       
        // Returns one PortfolioOverview per portfolio, with live-value summaries
        [HttpGet("overview")]
public async Task<ActionResult<IEnumerable<PortfolioOverview>>> GetOverviews()
{
    // 1) Load all portfolios (id + name + createdAt)
    var portfolios = _portfolioRepo.GetPortfolios().ToList();
    var overviews  = new List<PortfolioOverview>(portfolios.Count);

    foreach (var p in portfolios)
    {
        // 2) Fetch the holdings for this portfolio
        var items = _itemRepo.getByPortfolio(p.Id);

        // 3) If there are no holdings, return zeros
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

        // 4) Pull out all non‐empty tickers
        var tickers = items
            .Select(i => i.Ticker)
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Distinct()
            .ToArray();

        decimal totalCost  = 0m;
        decimal totalValue = 0m;

        // 5) Only call Yahoo if we actually have tickers
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
                    // compute “what I paid”
                    var cost = itm.PurchasePrice * itm.Quantity;
                    totalCost += cost;

                    // safely get current price (default to 0 if missing)
                     if (priceData.ContainsKey(itm.Ticker))
                    {
                        var security = priceData[itm.Ticker];
                        decimal currentPrice = (decimal) security.RegularMarketPrice;
                        totalValue += currentPrice * itm.Quantity;
                    }
                }
            }
            catch (Exception)
            {
                // log this exception as needed, but carry on with zeros
                // e.g. _logger.LogWarning(ex, "Yahoo Finance call failed");
            }
        }

        // 6) Compute profit/loss & percent
        var profitLoss   = totalValue - totalCost;
        var changePct    = totalCost == 0
                         ? 0
                         : Math.Round((profitLoss / totalCost) * 100, 2);

        // 7) Add the overview item
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

