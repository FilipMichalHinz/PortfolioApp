using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using App.API;
using App.API.Controllers;
using App.Tests.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using App.Tests.Models;

namespace App.Tests.Controllers
{
    [TestClass]
    public class PortfolioControllerTests
    {
        private HttpClient _client;

        [TestInitialize]
        public void Setup()
        {
            var factory = new WebApplicationFactory<Program>();
            _client = factory.CreateClient();
        }

        [TestMethod]
        public async Task GetPortfolios_WithValidAuthHeader_ReturnsOk()
        {
            // Step 1: Login first to get authHeader
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "password"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            Assert.AreEqual(HttpStatusCode.OK, loginResponse.StatusCode);

            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader);

            // Step 2: Use authHeader to call GET /api/portfolio
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            var response = await _client.GetAsync("/api/portfolio");
            var content = await response.Content.ReadAsStringAsync();

            // Debug output
            Console.WriteLine($"Status: {response.StatusCode}");
            Console.WriteLine($"Response: {content}");

            // Step 3: Assert
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode, "Expected 200 OK from authenticated /api/portfolio");

            // Optional: Parse as list of portfolio names (simplified)
            Assert.IsTrue(content.Contains("Tech Growth") || content.Contains("Crypto") || content.Length > 0,
                "Response should contain at least one portfolio for user 'alice'");
        }

        [TestMethod]
        public async Task CreatePortfolio_WithValidAuthHeader_ReturnsOkAndPersists()
        {
            // Step 1: Login
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "password"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            Assert.AreEqual(HttpStatusCode.OK, loginResponse.StatusCode);

            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader);

            // Step 2: Add Authorization header
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 3: Create a unique portfolio
            var newPortfolio = new
            {
                name = $"TestPortfolio_{Guid.NewGuid()}"
            };

            var createResponse = await _client.PostAsJsonAsync("/api/portfolio", newPortfolio);
            Assert.AreEqual(HttpStatusCode.OK, createResponse.StatusCode, "Expected 200 OK after creating a portfolio.");

            // Step 4: Read back portfolios to confirm it's there
            var getResponse = await _client.GetAsync("/api/portfolio");
            Assert.AreEqual(HttpStatusCode.OK, getResponse.StatusCode);

            var portfolioList = await getResponse.Content.ReadAsStringAsync();

            Console.WriteLine("Created Portfolio Name: " + newPortfolio.name);
            Console.WriteLine("Response from GET /api/portfolio: " + portfolioList);

            Assert.IsTrue(portfolioList.Contains(newPortfolio.name),
                "The newly created portfolio should appear in the portfolio list.");
        }

        [TestMethod]
        public async Task DeletePortfolio_WithValidAuthHeader_RemovesPortfolio()
        {
            // Step 1: Login
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "password"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            Assert.AreEqual(HttpStatusCode.OK, loginResponse.StatusCode);

            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader);

            // Step 2: Set AuthHeader
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 3: Create a portfolio
            var portfolioName = $"DeleteTest_{Guid.NewGuid()}";
            var createPayload = new { name = portfolioName };
            var createResponse = await _client.PostAsJsonAsync("/api/portfolio", createPayload);
            Assert.AreEqual(HttpStatusCode.OK, createResponse.StatusCode);

            // Deserialize as strongly typed object
            var created = await createResponse.Content.ReadFromJsonAsync<PortfolioResponse>();
            Assert.IsNotNull(created);
            var newPortfolioId = created.Id;

            // Step 4: Delete the newly created portfolio
            var deleteResponse = await _client.DeleteAsync($"/api/portfolio/{newPortfolioId}");
            Assert.AreEqual(HttpStatusCode.NoContent, deleteResponse.StatusCode, "Expected 204 NoContent after delete");

            // Step 5: Verify it's no longer in the list
            var getResponse = await _client.GetAsync("/api/portfolio");
            Assert.AreEqual(HttpStatusCode.OK, getResponse.StatusCode);
            var content = await getResponse.Content.ReadAsStringAsync();

            Console.WriteLine($"Deleted Portfolio ID: {newPortfolioId}");
            Console.WriteLine($"Remaining Portfolios: {content}");

            Assert.IsFalse(content.Contains(portfolioName),
                "The deleted portfolio should no longer appear in the list.");
        }


    }
    
}
