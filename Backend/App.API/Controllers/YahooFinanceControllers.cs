// These namespaces give us access to controller features and the Yahoo Finance library
using Microsoft.AspNetCore.Mvc;
using YahooFinanceApi;

namespace App.API.Controllers
{
    // This defines that this class is an API controller, and its route will be "api/yahoo"
    [Route("api/yahoo")]
    [ApiController]
    public class YahooFinanceController : ControllerBase
    {
        // This method responds to HTTP GET requests like: api/yahoo?ticker=AAPL
        [HttpGet]
        public async Task<IActionResult> Get(string ticker)
        {
            // Simple validation: if the user didn’t type anything
            if (string.IsNullOrEmpty(ticker))
            {
                return BadRequest("Ticker cannot be empty.");
            }

            try
            {
                // Fetches financial data from Yahoo for the given ticker (like "AAPL")
                var result = await Yahoo
                    .Symbols(ticker)
                    .Fields(Field.Symbol, Field.LongName, Field.RegularMarketPrice)
                    .QueryAsync();

                // If the ticker was not found in the result
                if (!result.ContainsKey(ticker))
                {
                    return NotFound("Ticker not found.");
                }

                // Access the stock info from the result
                var stock = result[ticker];

                // Return the important parts to the frontend (Symbol, Name, Price)
                return Ok(new
                {
                    Symbol = stock[Field.Symbol],
                    Name = stock[Field.LongName],
                    Price = stock[Field.RegularMarketPrice]
                });
            }
            catch
            {
                // If anything crashes (e.g. no internet), we send a generic error message
                return StatusCode(500, "Something went wrong. Please try again.");
            }
        }
    }
}