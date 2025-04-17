namespace App.API.Controllers
{
    using App.Model.Entities;
    using App.Model.Repositories;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/[controller]")]
    [ApiController]
    public class PortfolioController : ControllerBase
    {
        protected PortfolioRepository Repository { get; }

        public PortfolioController(PortfolioRepository repository)
        {
            Repository = repository;
        }

        [HttpGet("{id}")]
        public ActionResult<Portfolio> GetPortfolio([FromRoute] int id)
        {
            Portfolio portfolio = Repository.GetPortfolioById(id);
            if (portfolio == null)
            {
                return NotFound();
            }
            return Ok(portfolio);
        }

        [HttpGet]
        public ActionResult<IEnumerable<Portfolio>> GetPortfolios()
        {
            return Ok(Repository.GetPortfolios());
        }

        [HttpPost]
        public ActionResult<Portfolio> Post([FromBody] Portfolio portfolio)
        {
            if (portfolio == null)
            {
                return BadRequest("Portfolio info not correct");
            }
            bool status = Repository.InsertPortfolio(portfolio);
            if (status)
            {
                // Wichtig: Das zurückgegebene Objekt enthält nun die vom DB generierte ID.
                return Ok(portfolio);
            }
            return BadRequest();
        }

        [HttpPut]
        public ActionResult UpdatePortfolio([FromBody] Portfolio portfolio)
        {
            if (portfolio == null)
            {
                return BadRequest("Portfolio info not correct");
            }

            Portfolio existingPortfolio = Repository.GetPortfolioById(portfolio.Id);
            if (existingPortfolio == null)
            {
                return NotFound($"Portfolio with id {portfolio.Id} not found");
            }

            bool status = Repository.UpdatePortfolio(portfolio);
            if (status)
            {
                return Ok();
            }
            return BadRequest("Something went wrong");
        }

        [HttpDelete("{id}")]
        public ActionResult DeletePortfolio([FromRoute] int id)
        {
            Portfolio existingPortfolio = Repository.GetPortfolioById(id);
            if (existingPortfolio == null)
            {
                return NotFound($"Portfolio with id {id} not found");
            }

            bool status = Repository.DeletePortfolio(id);
            if (status)
            {
                return NoContent();
            }
            return BadRequest($"Unable to delete Portfolio with id {id}");
        }
    }
}
