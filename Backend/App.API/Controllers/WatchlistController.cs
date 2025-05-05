namespace App.API.Controllers
{
    using App.Model.Entities;
    using App.Model.Repositories;
    using Microsoft.AspNetCore.Mvc;

    // API route: api/watchlist
    [Route("api/[controller]")]
    [ApiController]
    public class WatchlistController : ControllerBase
    {
        // Repository for interacting with the 'watchlist' table
        protected WatchlistRepository Repository { get; }

        // Inject WatchlistRepository via constructor
        public WatchlistController(WatchlistRepository repository)
        {
            Repository = repository;
        }

        // GET: api/watchlist/portfolio/{portfolioId}
        // Retrieves all watchlist items for a specific portfolio
        [HttpGet("portfolio/{portfolioId}")]
        public ActionResult<IEnumerable<Watchlist>> GetByPortfolio([FromRoute] int portfolioId)
        {
            var items = Repository.GetWatchlistByPortfolio(portfolioId);
            return Ok(items);
        }

        // POST: api/watchlist
        // Adds a new asset to the watchlist
        [HttpPost]
        public ActionResult Post([FromBody] Watchlist item)
        {
            if (item == null)
            {
                return BadRequest("Watchlist item not correct");
            }

            bool status = Repository.InsertWatchlistItem(item);
            if (status)
            {
                return Ok(); // Successfully inserted
            }
            return BadRequest("Unable to insert watchlist item");
        }

        // DELETE: api/watchlist/{id}
        // Deletes a watchlist item by its ID
        [HttpDelete("{id}")]
        public ActionResult Delete([FromRoute] int id)
        {
            bool status = Repository.DeleteWatchlistItem(id);
            if (status)
            {
                return NoContent(); // Deletion successful
            }
            return BadRequest($"Unable to delete watchlist item with id {id}");
        }
    }
}
