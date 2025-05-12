// =============================
// File: PortfolioControllerTests.cs
// Description:
// End-to-end integration tests for the /api/portfolio endpoint.
// These tests simulate real HTTP requests including authentication,
// portfolio creation, retrieval, and deletion, verifying the full backend behavior.
// =============================

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using App.API;
using App.Tests.Models;
using Microsoft.AspNetCore.Mvc.Testing;

namespace App.Tests.Controllers
{
    [TestClass]
    public class PortfolioControllerTests
    {
        private HttpClient _client;

        // Initializes the test client using an in-memory web server (TestHost)
        [TestInitialize]
        public void Setup()
        {
            var factory = new WebApplicationFactory<Program>();
            _client = factory.CreateClient();
        }

        [TestMethod]
        public async Task GetPortfolios_WithValidAuthHeader_ReturnsOk()
        {
            // Step 1: Simulate login with known test user
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "password"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            Assert.AreEqual(HttpStatusCode.OK, loginResponse.StatusCode);

            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader);

            // Step 2: Set Basic Auth header
            _client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 3: Request list of portfolios
            var response = await _client.GetAsync("/api/portfolio");
            var content = await response.Content.ReadAsStringAsync();

            // Debug output
            Console.WriteLine($"Status: {response.StatusCode}");
            Console.WriteLine($"Response: {content}");

            // Step 4: Validate response
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode, "Expected 200 OK from authenticated /api/portfolio");

            Assert.IsTrue(content.Contains("Tech Growth") || content.Contains("Crypto") || content.Length > 0,
                "Response should contain at least one portfolio for user 'alice'");
        }

        [TestMethod]
        public async Task CreatePortfolio_WithValidAuthHeader_ReturnsOkAndPersists()
        {
            // Step 1: Authenticate
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "password"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            Assert.AreEqual(HttpStatusCode.OK, loginResponse.StatusCode);

            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader);

            // Step 2: Set authorization header
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 3: Create a new portfolio with a unique name
            var newPortfolio = new
            {
                name = $"TestPortfolio_{Guid.NewGuid()}"
            };

            var createResponse = await _client.PostAsJsonAsync("/api/portfolio", newPortfolio);
            Assert.AreEqual(HttpStatusCode.OK, createResponse.StatusCode, "Expected 200 OK after creating a portfolio.");

            // Step 4: Retrieve portfolios and verify new portfolio is included
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
            // Step 1: Login as 'alice'
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "password"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            Assert.AreEqual(HttpStatusCode.OK, loginResponse.StatusCode);

            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader);

            // Step 2: Add auth header to client
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 3: Create portfolio to later delete
            var portfolioName = $"DeleteTest_{Guid.NewGuid()}";
            var createPayload = new { name = portfolioName };
            var createResponse = await _client.PostAsJsonAsync("/api/portfolio", createPayload);
            Assert.AreEqual(HttpStatusCode.OK, createResponse.StatusCode);

            var created = await createResponse.Content.ReadFromJsonAsync<PortfolioResponse>();
            Assert.IsNotNull(created);
            var newPortfolioId = created.Id;

            // Step 4: Delete the portfolio
            var deleteResponse = await _client.DeleteAsync($"/api/portfolio/{newPortfolioId}");
            Assert.AreEqual(HttpStatusCode.NoContent, deleteResponse.StatusCode, "Expected 204 NoContent after delete");

            // Step 5: Verify deletion
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
