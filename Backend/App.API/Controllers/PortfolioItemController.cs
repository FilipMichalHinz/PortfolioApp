using App.Model.Entities;
using App.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using YahooFinanceApi;

namespace App.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PortfolioItemController : ControllerBase
    {
        protected PortfolioItemRepository Repository { get; }

        public PortfolioItemController(PortfolioItemRepository repository)
        {
            Repository = repository;
        }

        // Get all portfolio items for a specific portfolio
        [HttpGet("portfolios/{portfolioId}")]
        public ActionResult<IEnumerable<PortfolioItem>> GetByUser([FromRoute] int portfolioId)
        {
            var items = Repository.GetPortfolioItemsByPortfolio(portfolioId);
            return Ok(items);
        }

        // Add a new portfolio item
        [HttpPost]
        public ActionResult Post([FromBody] PortfolioItem item)
        {
            if (item == null)
            {
                return BadRequest("PortfolioItem info not correct");
            }

            bool status = Repository.InsertPortfolioItem(item);
            if (status)
            {
                return Ok();
            }
            return BadRequest("Unable to insert portfolio item");
        }

        // Delete a portfolio item by ID
        [HttpDelete("{id}")]
        public ActionResult Delete([FromRoute] int id)
        {
            bool status = Repository.DeletePortfolioItem(id);
            if (status)
            {
                return NoContent();
            }
            return BadRequest($"Unable to delete portfolio item with id {id}");
        }

        // Get value of a single portfolio item using Yahoo Finance
        [HttpGet("value")]
        public async Task<ActionResult> GetValue([FromQuery] string ticker)
        {
            PortfolioItem item = Repository.GetByTicker(ticker);

            if (item == null)
            {
                return NotFound("Portfolio item not found.");
            }

            try
            {
                var data = await Yahoo
                    .Symbols(ticker)
                    .Fields(Field.RegularMarketPrice)
                    .QueryAsync();

                if (!data.ContainsKey(ticker))
                {
                    return NotFound("Ticker not found on Yahoo.");
                }

                decimal currentPrice = (decimal)data[ticker][Field.RegularMarketPrice];
                decimal quantity = item.Quantity;
                decimal purchasePrice = item.PurchasePrice;
                decimal initialInvestment = quantity * purchasePrice;
                decimal currentValue = quantity * currentPrice;
                decimal profitLoss = currentValue - initialInvestment;
                decimal changePercent = initialInvestment == 0 ? 0 : (profitLoss / initialInvestment) * 100;

                return Ok(new
                {
                    Ticker = ticker,
                    Quantity = quantity,
                    PurchasePrice = purchasePrice,
                    CurrentPrice = currentPrice,
                    InitialInvestment = initialInvestment,
                    CurrentValue = currentValue,
                    ProfitLoss = profitLoss,
                    ChangePercent = Math.Round(changePercent, 2)
                });
            }
            catch (Exception)
            {
                return StatusCode(500, "Error while fetching Yahoo data.");
            }
        }

        // Get summary of the entire portfolio
        [HttpGet("summary/{portfolioId}")]
        public async Task<IActionResult> GetPortfolioSummary(int portfolioId)
        {
            var items = Repository.GetPortfolioItemsByPortfolio(portfolioId);
            if (items == null || !items.Any())
            {
                return NotFound("No portfolio items found for this portfolio.");
            }

            var tickers = items.Select(i => i.Ticker).Distinct().ToArray();

            var prices = await Yahoo
                .Symbols(tickers)
                .Fields(Field.RegularMarketPrice)
                .QueryAsync();

            decimal totalInvestment = 0;
            decimal totalCurrentValue = 0;

            var summaryList = new List<object>();

            foreach (var item in items)
            {
                if (!prices.ContainsKey(item.Ticker)) continue;

                decimal currentPrice = (decimal)prices[item.Ticker][Field.RegularMarketPrice];
                decimal initialInvestment = item.PurchasePrice * item.Quantity;
                decimal currentValue = currentPrice * item.Quantity;
                decimal profitLoss = currentValue - initialInvestment;
                decimal changePercent = initialInvestment == 0 ? 0 : (profitLoss / initialInvestment) * 100;

                totalInvestment += initialInvestment;
                totalCurrentValue += currentValue;

                summaryList.Add(new
                {
                    Ticker = item.Ticker,
                    Quantity = item.Quantity,
                    PurchasePrice = item.PurchasePrice,
                    CurrentPrice = currentPrice,
                    InitialInvestment = initialInvestment,
                    CurrentValue = currentValue,
                    ProfitLoss = profitLoss,
                    ChangePercent = Math.Round(changePercent, 2)
                });
            }

            var totalProfitLoss = totalCurrentValue - totalInvestment;
            var totalChangePercent = totalInvestment == 0 ? 0 : (totalProfitLoss / totalInvestment) * 100;

            return Ok(new
            {
                PortfolioId = portfolioId,
                InitialInvestment = totalInvestment,
                CurrentValue = totalCurrentValue,
                TotalProfitLoss = totalProfitLoss,
                ChangePercent = Math.Round(totalChangePercent, 2),
                ByAsset = summaryList
            });
        }
    }
}
