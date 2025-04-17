namespace App.API.Controllers
{
    using App.Model.Entities;
    using App.Model.Repositories;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/[controller]")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        protected TransactionRepository Repository { get; }

        public TransactionController(TransactionRepository repository)
        {
            Repository = repository;
        }

        [HttpGet("portfolio/{portfolioItemId}")]
        public ActionResult<IEnumerable<Transaction>> GetByPortfolioItem([FromRoute] int portfolioItemId)
        {
            var transactions = Repository.GetTransactionsByPortfolioItem(portfolioItemId);
            return Ok(transactions);
        }

        [HttpPost]
        public ActionResult Post([FromBody] Transaction transaction)
        {
            if (transaction == null)
            {
                return BadRequest("Transaction info not correct");
            }

            bool status = Repository.InsertTransaction(transaction);
            if (status)
            {
                return Ok();
            }
            return BadRequest("Unable to insert transaction");
        }
    }
}
