namespace App.API.Controllers
{
    using App.Model.Entities;
    using App.Model.Repositories;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/[controller]")]
    [ApiController]
    public class WatchlistController : ControllerBase
    {
        protected WatchlistRepository Repository { get; }

        public WatchlistController(WatchlistRepository repository)
        {
            Repository = repository;
        }

        [HttpGet("portfolio/{portfolioId}")]
        public ActionResult<IEnumerable<Watchlist>> GetByPortfolio([FromRoute] int portfolioId)
        {
            var items = Repository.GetWatchlistByPortfolio(portfolioId);
            return Ok(items);
        }

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
                return Ok();
            }
            return BadRequest("Unable to insert watchlist item");
        }

        [HttpDelete("{id}")]
        public ActionResult Delete([FromRoute] int id)
        {
            bool status = Repository.DeleteWatchlistItem(id);
            if (status)
            {
                return NoContent();
            }
            return BadRequest($"Unable to delete watchlist item with id {id}");
        }
    }
}
