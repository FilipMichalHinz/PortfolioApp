using App.Model.Entities;
using App.Model.Repositories;
using Microsoft.AspNetCore.Mvc;
using YahooFinanceApi;

namespace App.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WatchlistController : ControllerBase
    {
        protected WatchlistRepository Repository { get; }

        public WatchlistController(WatchlistRepository repository)
        {
            Repository = repository;
        }

        // 🔐 Get authenticated user ID from request (set via middleware)
        private int GetUserId()
        {
            if (HttpContext.Items["UserId"] is int userId)
                return userId;

            throw new Exception("User not authenticated");
        }

        [HttpGet]
        public ActionResult<List<Watchlist>> GetMyWatchlist()
        {
            int userId = GetUserId();
            var items = Repository.GetWatchlistByUser(userId);

            if (items == null || items.Count == 0)
                return NotFound("Your watchlist is empty, add some items!");

            return Ok(items);
        }

        [HttpPost]
        public ActionResult Add([FromBody] Watchlist item)
        {
            if (item == null)
                return BadRequest("Invalid watchlist item");

            item.UserId = GetUserId();
            bool created = Repository.InsertWatchlistItem(item);

            return created ? Ok(item) : BadRequest("Unable to insert watchlist item");
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            bool status = Repository.DeleteWatchlistItem(id);
            return status ? NoContent() : BadRequest($"Unable to delete watchlist item with id {id}");
        }

        [HttpPut("{id}")]
        public ActionResult Update(int id, [FromBody] decimal targetPrice)
        {
            if (targetPrice <= 0)
                return BadRequest("Invalid target price.");

            int userId = GetUserId();

            var existingItem = Repository.GetWatchlistItemById(id, userId);
            if (existingItem == null)
                return NotFound($"Watchlist item with id {id} not found or not accessible.");

            existingItem.TargetPrice = targetPrice;

            bool updated = Repository.UpdateWatchlistItem(existingItem, userId);
            return updated ? Ok() : BadRequest("Unable to update watchlist item.");
        }

        [HttpGet("with-prices")]
        public async Task<ActionResult> GetWithPrices()
        {
            int userId = GetUserId();
            var items = Repository.GetWatchlistByUser(userId);

            if (items == null || items.Count == 0)
                return Ok(new List<object>());

            var output = new List<object>();
            foreach (var w in items)
            {
                var yahoo = await Yahoo
                    .Symbols(w.Ticker)
                    .Fields(Field.RegularMarketPrice)
                    .QueryAsync();

                decimal? price = null;
                if (yahoo.TryGetValue(w.Ticker, out var data))
                    price = (decimal)data.RegularMarketPrice;

                output.Add(new
                {
                    w.Id,
                    w.Ticker,
                    w.AssetName,
                    w.TargetPrice,
                    CurrentPrice = price
                });
            }

            return Ok(output);
        }
    }
}
