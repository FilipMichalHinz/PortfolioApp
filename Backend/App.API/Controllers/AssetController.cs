// =============================
// File: AssetController.cs
// Description:
// Manages assets (stocks, ETFs, etc.) linked to user portfolios. 
// Supports adding, updating, deleting, and querying assets, 
// as well as computing real-time valuation and performance metrics using Yahoo Finance.
// =============================

using App.Model.Entities;
using App.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using YahooFinanceApi;

namespace App.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssetController : ControllerBase
    {
        protected AssetRepository Repository { get; }
        protected PortfolioRepository PortfolioRepository { get; }

        public AssetController(AssetRepository repository, PortfolioRepository portfolioRepository)
        {
            Repository = repository;
            PortfolioRepository = portfolioRepository;
        }

        // Helper to get authenticated user ID from HTTP context
        private int GetAuthenticatedUserId()
        {
            if (HttpContext.Items.TryGetValue("UserId", out var userIdObj) && userIdObj is int userId)
                return userId;

            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        // GET /api/asset/portfolios/{portfolioId}
        // Returns all assets associated with a given portfolio, owned by the authenticated user
        [HttpGet("portfolios/{portfolioId}")]
        public ActionResult<IEnumerable<Asset>> GetByUser([FromRoute] int portfolioId)
        {
            var userId = GetAuthenticatedUserId();
            var portfolio = PortfolioRepository.GetPortfolioById(portfolioId, userId);
            if (portfolio == null)
                return Unauthorized("You do not own this portfolio.");

            var items = Repository.GetByPortfolio(portfolioId);
            return Ok(items);
        }

        // POST /api/asset
        // Adds a new asset to the user's portfolio
        [HttpPost]
        public ActionResult Post([FromBody] Asset item)
        {
            if (item == null)
                return BadRequest("Asset info not correct");

            var userId = GetAuthenticatedUserId();
            var portfolio = PortfolioRepository.GetPortfolioById(item.PortfolioId, userId);
            if (portfolio == null)
                return Unauthorized("You do not own this portfolio.");

            var result = Repository.InsertAssetAndReturn(item);
            return result != null ? Ok(result) : BadRequest("Unable to insert asset");
        }

        // DELETE /api/asset/{id}
        // Deletes a specific asset if it belongs to the authenticated user's portfolio
        [HttpDelete("{id}")]
        public ActionResult Delete([FromRoute] int id)
        {
            var userId = GetAuthenticatedUserId();
            var item = Repository.GetById(id);
            if (item == null)
                return NotFound();

            var portfolio = PortfolioRepository.GetPortfolioById(item.PortfolioId, userId);
            if (portfolio == null)
                return Unauthorized("You do not own this portfolio.");

            bool status = Repository.DeleteAsset(id);
            return status ? NoContent() : BadRequest($"Unable to delete asset with id {id}");
        }

        // GET /api/asset/value?ticker=XYZ
        // Returns current valuation and profit/loss of a specific asset by ticker
        [HttpGet("value")]
        public async Task<ActionResult> GetValue([FromQuery] string ticker)
        {
            var item = Repository.GetByTicker(ticker);
            if (item == null)
                return NotFound("Asset not found.");

            var userId = GetAuthenticatedUserId();
            var portfolio = PortfolioRepository.GetPortfolioById(item.PortfolioId, userId);
            if (portfolio == null)
                return Unauthorized("You do not own this portfolio.");

            try
            {
                var data = await Yahoo
                    .Symbols(ticker)
                    .Fields(Field.RegularMarketPrice)
                    .QueryAsync();

                if (!data.ContainsKey(ticker))
                    return NotFound("Ticker not found on Yahoo.");

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
            catch
            {
                return StatusCode(500, "Error while fetching Yahoo data.");
            }
        }

        // GET /api/asset/summary/{portfolioId}
        // Returns detailed valuation and performance summary of all assets in a given portfolio
        [HttpGet("summary/{portfolioId}")]
        public async Task<IActionResult> GetPortfolioSummary(int portfolioId)
        {
            var userId = GetAuthenticatedUserId();
            var portfolio = PortfolioRepository.GetPortfolioById(portfolioId, userId);
            if (portfolio == null)
                return Unauthorized("You do not own this portfolio.");

            var items = Repository.GetByPortfolio(portfolioId);
            if (items == null || !items.Any())
                return Ok(new {
                    PortfolioId = portfolioId,
                    InitialInvestment = 0m,
                    CurrentValue = 0m,
                    TotalProfitLoss = 0m,
                    ChangePercent = 0m,
                    ByAsset = new List<object>()
                });

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
                decimal initialInvestment = item.PurchasePrice * item.Quantity;
                decimal currentPrice;
                decimal currentValue;
                decimal profitLoss;
                decimal changePercent;

                if (item.IsSold)
                {
                    currentPrice = item.ExitPrice ?? 0;
                    currentValue = currentPrice * item.Quantity;
                }
                else
                {
                    if (!prices.ContainsKey(item.Ticker)) continue;
                    currentPrice = (decimal)prices[item.Ticker][Field.RegularMarketPrice];
                    currentValue = currentPrice * item.Quantity;
                }

                profitLoss = currentValue - initialInvestment;
                changePercent = initialInvestment == 0 ? 0 : (profitLoss / initialInvestment) * 100;

                totalInvestment += initialInvestment;
                totalCurrentValue += currentValue;

                summaryList.Add(new
                {
                    Id = item.Id,
                    Ticker = item.Ticker,
                    Quantity = item.Quantity,
                    PurchasePrice = item.PurchasePrice,
                    CurrentPrice = currentPrice,
                    InitialInvestment = initialInvestment,
                    CurrentValue = currentValue,
                    ProfitLoss = profitLoss,
                    ChangePercent = Math.Round(changePercent, 2),
                    IsSold = item.IsSold,
                    ExitPrice = item.ExitPrice,
                    ExitDate = item.ExitDate
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

        // PUT /api/asset/update
        // Updates general details of an asset (not sell-specific)
        [HttpPut("update")]
        public ActionResult UpdateItem([FromBody] Asset item)
        {
            if (item == null)
                return BadRequest("Invalid asset");

            var userId = GetAuthenticatedUserId();
            var portfolio = PortfolioRepository.GetPortfolioById(item.PortfolioId, userId);
            if (portfolio == null)
                return Unauthorized("You do not own this portfolio.");

            bool ok = Repository.UpdateAssetDetails(item);
            return ok ? Ok(item) : BadRequest("Update failed");
        }

        // PUT /api/asset/sell
        // Marks an asset as sold and records exit price and date
        [HttpPut("sell")]
        public ActionResult SellAsset([FromBody] SellAssetRequest request)
        {
            if (request == null)
                return BadRequest("Invalid sell request.");

            var userId = GetAuthenticatedUserId();
            var item = Repository.GetById(request.Id);
            if (item == null)
                return NotFound($"Asset with ID {request.Id} not found.");

            var portfolio = PortfolioRepository.GetPortfolioById(item.PortfolioId, userId);
            if (portfolio == null)
                return Unauthorized("You do not own this portfolio.");

            item.ExitPrice = request.ExitPrice;
            item.ExitDate = request.ExitDate;
            item.IsSold = true;

            bool updated = Repository.UpdateAsset(item);
            return updated ? Ok(item) : BadRequest("Failed to mark asset as sold.");
        }
    }

    // Payload model for selling an asset
    public class SellAssetRequest
    {
        public int Id { get; set; }
        public decimal ExitPrice { get; set; }
        public DateTime ExitDate { get; set; }
    }
}
