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
        private readonly PortfolioRepository _portfolioRepo;
        private readonly AssetRepository _itemRepo;

        public PortfolioController(
            PortfolioRepository portfolioRepo,
            AssetRepository itemRepo)
        {
            _portfolioRepo = portfolioRepo;
            _itemRepo = itemRepo;
        }

        private int GetAuthenticatedUserId()
        {
            if (HttpContext.Items.TryGetValue("UserId", out var userIdObj) && userIdObj is int userId)
                return userId;

            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        [HttpGet("{id}")]
        public ActionResult<Portfolio> GetPortfolio([FromRoute] int id)
        {
            int userId = GetAuthenticatedUserId();
            var portfolio = _portfolioRepo.GetPortfolioById(id, userId);
            return portfolio == null ? NotFound() : Ok(portfolio);
        }

        [HttpGet]
        public ActionResult<IEnumerable<Portfolio>> GetPortfolios()
        {
            int userId = GetAuthenticatedUserId();
            var list = _portfolioRepo.GetPortfoliosByUser(userId);
            return Ok(list);
        }

        [HttpGet("overview")]
        public async Task<ActionResult<IEnumerable<PortfolioOverview>>> GetOverviews()
        {
            int userId = GetAuthenticatedUserId();
            var portfolios = _portfolioRepo.GetPortfoliosByUser(userId).ToList();
            var overviews = new List<PortfolioOverview>(portfolios.Count);

            foreach (var p in portfolios)
            {
                var items = _itemRepo.GetByPortfolio(p.Id);

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
                        var priceData = await Yahoo
                            .Symbols(tickers)
                            .Fields(Field.RegularMarketPrice)
                            .QueryAsync();

                        foreach (var itm in items)
                        {
                            var cost = itm.PurchasePrice * itm.Quantity;
                            totalCost += cost;

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
                    }
                }

                var profitLoss = totalValue - totalCost;
                var changePct = totalCost == 0
                    ? 0
                    : Math.Round((profitLoss / totalCost) * 100, 2);

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

        [HttpPost]
        public ActionResult<Portfolio> Post([FromBody] Portfolio portfolio)
        {
            if (portfolio == null)
                return BadRequest("Portfolio info not correct");

            portfolio.UserId = GetAuthenticatedUserId();

            var success = _portfolioRepo.InsertPortfolio(portfolio);
            return success ? Ok(portfolio) : BadRequest("Unable to insert portfolio");
        }

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
