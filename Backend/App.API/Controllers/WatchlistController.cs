// =============================
// File: WatchlistController.cs
// Description:
// Provides authenticated endpoints for managing a user's watchlist.
// Supports CRUD operations (create, read, update, delete) on watchlist entries,
// and can also fetch current market prices for tracked tickers using Yahoo Finance API.
// =============================

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

        // Inject WatchlistRepository via dependency injection
        public WatchlistController(WatchlistRepository repository)
        {
            Repository = repository;
        }

        // Retrieve the authenticated user's ID from the HTTP context (set by authentication middleware)
        private int GetUserId()
        {
            if (HttpContext.Items["UserId"] is int userId)
                return userId;

            throw new Exception("User not authenticated");
        }

        // GET /api/watchlist
        // Returns all watchlist items for the current user
        [HttpGet]
        public ActionResult<List<Watchlist>> GetMyWatchlist()
        {
            int userId = GetUserId();
            var items = Repository.GetWatchlistByUser(userId);

            if (items == null || items.Count == 0)
                return NotFound("Your watchlist is empty, add some items!");

            return Ok(items);
        }

        // POST /api/watchlist
        // Adds a new item to the user's watchlist
        [HttpPost]
        public ActionResult Add([FromBody] Watchlist item)
        {
            if (item == null)
                return BadRequest("Invalid watchlist item");

            item.UserId = GetUserId();
            bool created = Repository.InsertWatchlistItem(item);

            return created ? Ok(item) : BadRequest("Unable to insert watchlist item");
        }

        // DELETE /api/watchlist/{id}
        // Deletes a watchlist item by ID
        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            bool status = Repository.DeleteWatchlistItem(id);
            return status ? NoContent() : BadRequest($"Unable to delete watchlist item with id {id}");
        }

        // PUT /api/watchlist/{id}
        // Updates the target price of a watchlist item
        [HttpPut("{id}")]
        public ActionResult Update(int id, [FromBody] decimal targetPrice)
        {
            if (targetPrice <= 0)
                return BadRequest("Invalid target price.");

            int userId = GetUserId();

            // Ensure the watchlist item belongs to the current user
            var existingItem = Repository.GetWatchlistItemById(id, userId);
            if (existingItem == null)
                return NotFound($"Watchlist item with id {id} not found or not accessible.");

            existingItem.TargetPrice = targetPrice;

            bool updated = Repository.UpdateWatchlistItem(existingItem, userId);
            return updated ? Ok() : BadRequest("Unable to update watchlist item.");
        }

        // GET /api/watchlist/with-prices
        // Returns the user's watchlist with current market prices via Yahoo Finance
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
                // Query Yahoo Finance for the current price of each ticker
                var yahoo = await Yahoo
                    .Symbols(w.Ticker)
                    .Fields(Field.RegularMarketPrice)
                    .QueryAsync();

                decimal? price = null;

                if (yahoo.TryGetValue(w.Ticker, out var data))
                    price = (decimal)data.RegularMarketPrice;

                // Add combined watchlist and market data to response
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
