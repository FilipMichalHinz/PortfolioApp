namespace App.API.Controllers
{
    using App.Model.Entities;
    using App.Model.Repositories;
    using Microsoft.AspNetCore.Mvc;

    using YahooFinanceApi;
    //using YahooFinanceApi.Fields;

    using System.Collections.Generic;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    public class WatchlistController : ControllerBase
    {
        protected WatchlistRepository Repository { get; }

        public WatchlistController(WatchlistRepository repository) // gateway to repo and database operations
        {
            Repository = repository;
        }

        // helper function to retrieve userid from middleware
        private int GetUserId()
        {
            if (HttpContext.Items["UserId"] is int userId)
                return userId; // returns userID if authenticated
            throw new Exception("User not authenticated");
        }

        [HttpGet]
        public ActionResult<List<Watchlist>> GetMyWatchlist()
        {
            int userId = GetUserId(); // get userid using helper function
            var items = Repository.GetWatchlistByUser(userId);

            if (items == null || items.Count == 0)
            {
                return NotFound($"Your watchlist is empty, add some items!");
            }
            return Ok(items);
        }

        [HttpPost]
        public ActionResult Add([FromBody] Watchlist item) // why change from "post" to "add"
        {
            if (item == null) // we could add validation here, so no whitespaces 
            
                return BadRequest("Invalid watchlist item");

            
            item.UserId = GetUserId(); // 

            bool created = Repository.InsertWatchlistItem(item);
            if (created)
            {
                return Ok();
            }
            return BadRequest("Unable to insert watchlist item");
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            bool status = Repository.DeleteWatchlistItem(id);
            if (status)
            {
                return NoContent();
            }
            return BadRequest($"Unable to delete watchlist item with id {id}");
        }

       [HttpPut("{id}")]
public ActionResult Update(int id, [FromBody] decimal targetPrice)
{
    if (targetPrice <= 0)
    {
        return BadRequest("Invalid target price.");
    }

    // 1. Use GetWatchlistItemById to retrieve the existing item
    var existingItem = Repository.GetWatchlistItemById(id);

    if (existingItem == null)
    {
        return NotFound($"Watchlist item with id {id} not found.");
    }

    // 2. Update the target price of the existing item
    existingItem.TargetPrice = targetPrice;

    // 3. Use the repository to update the item in the database
    bool updated = Repository.UpdateWatchlistItem(existingItem);
    if (updated)
    {
        return Ok();
    }
    return BadRequest("Unable to update watchlist item.");
}

        // Get current value of asset using Yahoo finance 
        [HttpGet("with-prices")]
        public async Task<ActionResult> GetWithPrices()
        {
            //get user id using helpfunction 
            int userId = GetUserId();

            // load items from database
            var items = Repository.GetWatchlistByUser(userId);

            if (items == null || items.Count == 0)
                return Ok(new List<object>()); // return empty list if no items

            // send request to yf for each item and get price
            var output = new List<object>();
            foreach (var w in items)
            {
                var yahoo = await Yahoo
                    .Symbols(w.Ticker)
                    .Fields(Field.RegularMarketPrice)
                    .QueryAsync();

                    decimal? price = null;
                    // make sure it returns a value
                    if (yahoo.TryGetValue(w.Ticker, out var data))
                    {
                            price = (decimal)data.RegularMarketPrice;// returns a double by default, so convert to decimal                        
                    }
                    
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
