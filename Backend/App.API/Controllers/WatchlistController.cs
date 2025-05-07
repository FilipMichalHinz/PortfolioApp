using App.Model.Entities;
using App.Model.Repositories;
using Microsoft.AspNetCore.Mvc;

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

        private int GetAuthenticatedUserId()
        {
            if (HttpContext.Items.TryGetValue("UserId", out var userIdObj) && userIdObj is int userId)
                return userId;

            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        // GET: api/watchlist
        [HttpGet]
        public ActionResult<IEnumerable<Watchlist>> GetForUser()
        {
            var userId = GetAuthenticatedUserId();
            var items = Repository.GetWatchlistByUser(userId);
            return Ok(items);
        }

        // POST: api/watchlist
        [HttpPost]
        public ActionResult Post([FromBody] Watchlist item)
        {
            var userId = GetAuthenticatedUserId();

            if (item == null)
                return BadRequest("Invalid request");

            item.UserId = userId;

            bool status = Repository.InsertWatchlistItem(item);
            return status ? Ok() : BadRequest("Unable to insert watchlist item");
        }

        // DELETE: api/watchlist/{id}
        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            var userId = GetAuthenticatedUserId();
            var item = Repository.GetById(id);
            if (item == null)
                return NotFound();

            if (item.UserId != userId)
                return Forbid("Cannot delete item from another user");

            bool status = Repository.DeleteWatchlistItem(id);
            return status ? NoContent() : BadRequest("Unable to delete watchlist item");
        }
    }
}
