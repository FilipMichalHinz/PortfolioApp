using Microsoft.AspNetCore.Mvc;
using YahooFinanceApi;
using Microsoft.AspNetCore.Authorization;

namespace App.API.Controllers
{
    // Route: api/yahoo
    [Route("api/yahoo")]
    [ApiController]
    public class YahooFinanceController : ControllerBase
    {
        // GET: api/yahoo?ticker=AAPL
        // Public endpoint (no authentication) that returns basic stock info from Yahoo Finance
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> Get(string ticker)
        {
            // Validate input
            if (string.IsNullOrEmpty(ticker))
                return BadRequest("Ticker cannot be empty.");

            try
            {
                // Query Yahoo Finance for the given ticker and retrieve key fields
                var result = await Yahoo
                    .Symbols(ticker)
                    .Fields(Field.Symbol, Field.LongName, Field.RegularMarketPrice)
                    .QueryAsync();

                // If ticker not found in the response, return 404
                if (!result.ContainsKey(ticker))
                    return NotFound("Ticker not found.");

                var stock = result[ticker];

                // Return structured response with basic info
                return Ok(new
                {
                    Symbol = stock[Field.Symbol],
                    Name = stock[Field.LongName],
                    Price = stock[Field.RegularMarketPrice]
                });
            }
            catch
            {
                // Generic error handling
                return StatusCode(500, "Something went wrong. Please try again.");
            }
        }
    }
}
