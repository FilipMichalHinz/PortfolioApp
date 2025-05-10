using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using App.API;
using App.Tests.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using App.Tests.Models;

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
            // Step 1: Login
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "password"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader);
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 2: Create a portfolio
            var portfolioName = $"AssetTest_{Guid.NewGuid()}";
            var createPortfolio = new { name = portfolioName };
            var portfolioResponse = await _client.PostAsJsonAsync("/api/portfolio", createPortfolio);
            Assert.AreEqual(HttpStatusCode.OK, portfolioResponse.StatusCode);

            var portfolio = await portfolioResponse.Content.ReadFromJsonAsync<PortfolioResponse>();
            Assert.IsNotNull(portfolio);

            // Step 3: Create a new asset in that portfolio
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

            // Step 4: Assert result
            Assert.AreEqual(HttpStatusCode.OK, assetResponse.StatusCode, "Expected 200 OK after asset creation.");

            var responseText = await assetResponse.Content.ReadAsStringAsync();
            Console.WriteLine("Asset POST Response: " + responseText);

            Assert.IsTrue(responseText.Contains("AAPL"), "Response should include the ticker.");
            Assert.IsTrue(responseText.Contains("Apple"), "Response should include the name.");
        }

        [TestMethod]
        public async Task GetAssets_ForOwnPortfolio_ShouldReturnCreatedAsset()
        {
            // Step 1: Login
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "password"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader);
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 2: Create a portfolio
            var portfolioName = $"AssetGetTest_{Guid.NewGuid()}";
            var createPortfolio = new { name = portfolioName };
            var portfolioResponse = await _client.PostAsJsonAsync("/api/portfolio", createPortfolio);
            Assert.AreEqual(HttpStatusCode.OK, portfolioResponse.StatusCode);

            var portfolio = await portfolioResponse.Content.ReadFromJsonAsync<PortfolioResponse>();
            Assert.IsNotNull(portfolio);

            // Step 3: Add an asset
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

            // Step 4: GET assets for that portfolio
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
            // Step 1: Login
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "password"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader);

            // Set auth header
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 2: Create a new portfolio for the test
            var createPortfolio = new { name = $"DeleteAsset_{Guid.NewGuid()}" };
            var portfolioResponse = await _client.PostAsJsonAsync("/api/portfolio", createPortfolio);
            Assert.AreEqual(HttpStatusCode.OK, portfolioResponse.StatusCode);

            var portfolio = await portfolioResponse.Content.ReadFromJsonAsync<PortfolioResponse>();
            Assert.IsNotNull(portfolio);

            // Step 3: Add a new asset to that portfolio
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
            var assetId = asset.Id;

            Console.WriteLine("Created Asset ID: " + assetId);

            // Step 4: Delete the asset
            var deleteResponse = await _client.DeleteAsync($"/api/asset/{assetId}");
            Assert.AreEqual(HttpStatusCode.NoContent, deleteResponse.StatusCode, "Expected 204 NoContent after delete.");

            // Step 5: Verify the asset no longer exists
            var getResponse = await _client.GetAsync($"/api/asset/portfolios/{portfolio.Id}");
            var content = await getResponse.Content.ReadAsStringAsync();

            Console.WriteLine("Remaining Assets After Delete: " + content);

            Assert.IsFalse(content.Contains("TSLA"), "Asset should no longer be listed after deletion.");
        }


        [TestMethod]
        public async Task PostAsset_WithoutAuthHeader_ShouldReturnUnauthorized()
        {
            // This test verifies that accessing a protected endpoint (POST /api/asset)
            // without providing authentication credentials results in a 401 Unauthorized response.

            // Step 1: We do NOT log in and we do NOT set any Authorization header.
            // The client is anonymous.

            // Step 2: Attempt to POST a new asset without being authenticated.
            // The actual values of the payload are not important for this test,
            // since the request should be rejected purely based on missing authentication.
            var assetPayload = new
            {
                portfolioId = 1,  // Arbitrary portfolio ID (can be valid or invalid)
                ticker = "FAKE",
                name = "Unauthorized Asset",
                purchasePrice = 100.0m,
                quantity = 1,
                purchaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            // Send POST request without Authorization header
            var response = await _client.PostAsJsonAsync("/api/asset", assetPayload);

            // Step 3: Verify that the response status code is 401 Unauthorized,
            // indicating that access is denied for unauthenticated requests.
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode, 
                "Expected 401 Unauthorized for request without auth header.");
        }


    }
}
