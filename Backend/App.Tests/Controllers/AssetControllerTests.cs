// =============================
// File: AssetControllerTests.cs
// Description:
// Integration tests for the AssetController (/api/asset).
// These tests simulate real authenticated and unauthenticated requests, verifying correct asset creation,
// retrieval, deletion, and authorization behavior in the portfolio context.
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
    public class AssetControllerTests
    {
        private HttpClient _client;

        [TestInitialize]
        public void Setup()
        {
            var factory = new WebApplicationFactory<Program>();
            _client = factory.CreateClient();
        }

        [TestMethod]
        public async Task CreateAsset_ForOwnPortfolio_ShouldSucceed()
        {
            // Step 1: Login as test user
            var loginPayload = new Login { Username = "alice", Password = "password" };
            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader);

            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 2: Create a new portfolio
            var portfolioName = $"AssetTest_{Guid.NewGuid()}";
            var createPortfolio = new { name = portfolioName };
            var portfolioResponse = await _client.PostAsJsonAsync("/api/portfolio", createPortfolio);
            Assert.AreEqual(HttpStatusCode.OK, portfolioResponse.StatusCode);

            var portfolio = await portfolioResponse.Content.ReadFromJsonAsync<PortfolioResponse>();
            Assert.IsNotNull(portfolio);

            // Step 3: Create asset in the new portfolio
            var assetPayload = new
            {
                portfolioId = portfolio.Id,
                ticker = "AAPL",
                name = "Apple Inc.",
                purchasePrice = 150.00m,
                quantity = 10,
                purchaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            var assetResponse = await _client.PostAsJsonAsync("/api/asset", assetPayload);
            Assert.AreEqual(HttpStatusCode.OK, assetResponse.StatusCode);

            var responseText = await assetResponse.Content.ReadAsStringAsync();
            Console.WriteLine("Asset POST Response: " + responseText);

            Assert.IsTrue(responseText.Contains("AAPL"), "Response should include the ticker.");
            Assert.IsTrue(responseText.Contains("Apple"), "Response should include the name.");
        }

        [TestMethod]
        public async Task GetAssets_ForOwnPortfolio_ShouldReturnCreatedAsset()
        {
            // Step 1: Login
            var loginPayload = new Login { Username = "alice", Password = "password" };
            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader);

            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 2: Create portfolio
            var portfolioName = $"AssetGetTest_{Guid.NewGuid()}";
            var createPortfolio = new { name = portfolioName };
            var portfolioResponse = await _client.PostAsJsonAsync("/api/portfolio", createPortfolio);
            Assert.AreEqual(HttpStatusCode.OK, portfolioResponse.StatusCode);

            var portfolio = await portfolioResponse.Content.ReadFromJsonAsync<PortfolioResponse>();
            Assert.IsNotNull(portfolio);

            // Step 3: Add asset
            var assetPayload = new
            {
                portfolioId = portfolio.Id,
                ticker = "MSFT",
                name = "Microsoft Corp.",
                purchasePrice = 280.00m,
                quantity = 5,
                purchaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            var assetResponse = await _client.PostAsJsonAsync("/api/asset", assetPayload);
            Assert.AreEqual(HttpStatusCode.OK, assetResponse.StatusCode);

            // Step 4: GET asset list
            var getResponse = await _client.GetAsync($"/api/asset/portfolios/{portfolio.Id}");
            Assert.AreEqual(HttpStatusCode.OK, getResponse.StatusCode);

            var content = await getResponse.Content.ReadAsStringAsync();
            Console.WriteLine("GET Asset Response: " + content);

            Assert.IsTrue(content.Contains("MSFT"), "Response should contain the ticker 'MSFT'.");
            Assert.IsTrue(content.Contains("Microsoft"), "Response should contain the asset name.");
        }

        [TestMethod]
        public async Task DeleteAsset_ForOwnPortfolio_ShouldSucceed()
        {
            // Step 1: Login and authorize
            var loginPayload = new Login { Username = "alice", Password = "password" };
            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader);

            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 2: Create portfolio
            var createPortfolio = new { name = $"DeleteAsset_{Guid.NewGuid()}" };
            var portfolioResponse = await _client.PostAsJsonAsync("/api/portfolio", createPortfolio);
            Assert.AreEqual(HttpStatusCode.OK, portfolioResponse.StatusCode);

            var portfolio = await portfolioResponse.Content.ReadFromJsonAsync<PortfolioResponse>();
            Assert.IsNotNull(portfolio);

            // Step 3: Add asset
            var assetPayload = new
            {
                portfolioId = portfolio.Id,
                ticker = "TSLA",
                name = "Tesla Inc.",
                purchasePrice = 700.00m,
                quantity = 3,
                purchaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            var assetResponse = await _client.PostAsJsonAsync("/api/asset", assetPayload);
            Assert.AreEqual(HttpStatusCode.OK, assetResponse.StatusCode);

            var asset = await assetResponse.Content.ReadFromJsonAsync<AssetResponse>();
            Assert.IsNotNull(asset);

            Console.WriteLine("Created Asset ID: " + asset.Id);

            // Step 4: Delete asset
            var deleteResponse = await _client.DeleteAsync($"/api/asset/{asset.Id}");
            Assert.AreEqual(HttpStatusCode.NoContent, deleteResponse.StatusCode);

            // Step 5: Verify asset no longer in portfolio
            var getResponse = await _client.GetAsync($"/api/asset/portfolios/{portfolio.Id}");
            var content = await getResponse.Content.ReadAsStringAsync();

            Console.WriteLine("Remaining Assets After Delete: " + content);
            Assert.IsFalse(content.Contains("TSLA"), "Asset should no longer be listed after deletion.");
        }

        [TestMethod]
        public async Task PostAsset_WithoutAuthHeader_ShouldReturnUnauthorized()
        {
            // Attempt to create asset without authentication
            var assetPayload = new
            {
                portfolioId = 1, // dummy ID
                ticker = "FAKE",
                name = "Unauthorized Asset",
                purchasePrice = 100.0m,
                quantity = 1,
                purchaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            var response = await _client.PostAsJsonAsync("/api/asset", assetPayload);

            // Expect rejection due to missing Authorization header
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode,
                "Expected 401 Unauthorized for request without auth header.");
        }
    }
}
