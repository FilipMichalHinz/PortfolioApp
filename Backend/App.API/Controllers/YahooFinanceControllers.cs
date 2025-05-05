using Microsoft.AspNetCore.Mvc;
using YahooFinanceApi;
using Microsoft.AspNetCore.Authorization;

namespace App.API.Controllers
{
    [Route("api/yahoo")]
    [ApiController]
    public class YahooFinanceController : ControllerBase
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> Get(string ticker)
        {
            if (string.IsNullOrEmpty(ticker))
                return BadRequest("Ticker cannot be empty.");

            try
            {
                var result = await Yahoo
                    .Symbols(ticker)
                    .Fields(Field.Symbol, Field.LongName, Field.RegularMarketPrice)
                    .QueryAsync();

                if (!result.ContainsKey(ticker))
                    return NotFound("Ticker not found.");

                var stock = result[ticker];

                return Ok(new
                {
                    Symbol = stock[Field.Symbol],
                    Name = stock[Field.LongName],
                    Price = stock[Field.RegularMarketPrice]
                });
            }
            catch
            {
                return StatusCode(500, "Something went wrong. Please try again.");
            }
        }
    }
}
