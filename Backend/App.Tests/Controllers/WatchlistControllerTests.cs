// =============================
// File: WatchlistControllerTests.cs
// Description:
// Integration tests for the WatchlistController using a real HTTP client via WebApplicationFactory.
// These tests verify the full login + CRUD flow for authenticated users,
// including creation, retrieval, and deletion of watchlist items.
// =============================

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using App.API;
using App.Model.Entities;
using App.Tests.Models;
using Microsoft.AspNetCore.Mvc.Testing;

namespace App.Tests.Controllers
{
    [TestClass]
    public class WatchlistControllerTests
    {
        private HttpClient _client;

        // Set up a fresh HTTP client before each test using the in-memory test server
        [TestInitialize]
        public void Setup()
        {
            var factory = new WebApplicationFactory<Program>();
            _client = factory.CreateClient();
        }

        [TestMethod]
        public async Task CreateAndRetrieveWatchlistItem_ShouldSucceed()
        {
            // Step 1: Authenticate as known test user
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "password"
            };

            var loginResponse = await _client.PostAsJsonAsync("/api/login", loginPayload);
            var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.IsNotNull(loginResult?.AuthHeader, "Authentication should return an auth header");

            // Step 2: Add Basic Auth header to subsequent requests
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 3: Create new watchlist item
            var ticker = "AAPL";
            var item = new Watchlist
            {
                Ticker = ticker,
                AssetName = "Apple Inc.",
                TargetPrice = 180.00m
            };

            var postResponse = await _client.PostAsJsonAsync("/api/watchlist", item);
            Assert.AreEqual(HttpStatusCode.OK, postResponse.StatusCode, "Watchlist POST should succeed");

            // Step 4: Retrieve current watchlist
            var getResponse = await _client.GetAsync("/api/watchlist");
            Assert.AreEqual(HttpStatusCode.OK, getResponse.StatusCode, "Watchlist GET should succeed");

            var json = await getResponse.Content.ReadAsStringAsync();
            Console.WriteLine("Watchlist Response: " + json);

            // Step 5: Verify that the created item appears in the list
            Assert.IsTrue(json.Contains(ticker), $"Watchlist should contain the ticker '{ticker}'");
        }

        [TestMethod]
        public async Task DeleteWatchlistItem_ShouldRemoveItemSuccessfully()
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
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", loginResult.AuthHeader.Split(" ")[1]);

            // Step 2: Create a watchlist item to be deleted later
            var itemPayload = new Watchlist
            {
                Ticker = "NFLX",
                AssetName = "Netflix",
                TargetPrice = 350.00m
            };

            var createResponse = await _client.PostAsJsonAsync("/api/watchlist", itemPayload);
            Assert.AreEqual(HttpStatusCode.OK, createResponse.StatusCode);

            var created = await createResponse.Content.ReadFromJsonAsync<WatchlistResponse>();
            Assert.IsNotNull(created);
            Console.WriteLine($"Created Watchlist Item ID: {created.Id}");

            // Step 3: Delete the created watchlist item
            var deleteResponse = await _client.DeleteAsync($"/api/watchlist/{created.Id}");
            Assert.AreEqual(HttpStatusCode.NoContent, deleteResponse.StatusCode, "Expected 204 NoContent from DELETE.");

            // Step 4: Retrieve list to ensure the item was removed
            var getResponse = await _client.GetAsync("/api/watchlist");
            Assert.AreEqual(HttpStatusCode.OK, getResponse.StatusCode);

            var list = await getResponse.Content.ReadFromJsonAsync<List<WatchlistResponse>>();
            Assert.IsNotNull(list);

            Console.WriteLine("Remaining items after delete:");
            foreach (var item in list)
                Console.WriteLine($" - {item.Id}: {item.Ticker}");

            Assert.IsFalse(list.Any(w => w.Id == created.Id), "Deleted item should not appear in watchlist anymore.");
        }
    }
}
