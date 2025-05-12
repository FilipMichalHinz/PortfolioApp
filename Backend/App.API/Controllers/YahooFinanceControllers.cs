// =============================
// File: YahooFinanceController.cs
// Description:
// Defines a public API controller that provides basic stock information using Yahoo Finance data.
// It exposes a single GET endpoint that accepts a stock ticker and returns the symbol, company name,
// and current market price. This endpoint is accessible without authentication.
// =============================

using Microsoft.AspNetCore.Mvc;
using YahooFinanceApi;
using Microsoft.AspNetCore.Authorization;

namespace App.API.Controllers
{
    // Defines the base route for this controller: /api/yahoo
    [Route("api/yahoo")]
    [ApiController]
    public class YahooFinanceController : ControllerBase
    {
        // GET: /api/yahoo?ticker=AAPL
        // This endpoint is publicly accessible and does not require authentication
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> Get(string ticker)
        {
            // Input validation: reject empty or null ticker symbols
            if (string.IsNullOrEmpty(ticker))
                return BadRequest("Ticker cannot be empty.");

            try
            {
                // Asynchronously query Yahoo Finance for the specified ticker
                // Retrieve only selected fields to reduce payload and improve performance
                var result = await Yahoo
                    .Symbols(ticker)
                    .Fields(Field.Symbol, Field.LongName, Field.RegularMarketPrice)
                    .QueryAsync();

                // Check if the requested ticker exists in the result
                if (!result.ContainsKey(ticker))
                    return NotFound("Ticker not found.");

                var stock = result[ticker];

                // Return essential stock data in a structured JSON response
                return Ok(new
                {
                    Symbol = stock[Field.Symbol],
                    Name = stock[Field.LongName],
                    Price = stock[Field.RegularMarketPrice]
                });
            }
            catch
            {
                // Catch any exceptions (e.g., network errors, API failures)
                // and return a generic 500 Internal Server Error response
                return StatusCode(500, "Something went wrong. Please try again.");
            }
        }
    }
}
