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

        [TestInitialize]
        public void Setup()
        {
            var factory = new WebApplicationFactory<Program>();
            _client = factory.CreateClient();
        }

        [TestMethod]
        public async Task CreateAndRetrieveWatchlistItem_ShouldSucceed()
        {
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

            var ticker = "AAPL";
            var item = new Watchlist
            {
                Ticker = ticker,
                AssetName = "Apple Inc.",
                TargetPrice = 180.00m
            };

            var postResponse = await _client.PostAsJsonAsync("/api/watchlist", item);
            Assert.AreEqual(HttpStatusCode.OK, postResponse.StatusCode, "Watchlist POST should succeed");

            var getResponse = await _client.GetAsync("/api/watchlist");
            Assert.AreEqual(HttpStatusCode.OK, getResponse.StatusCode);

            var json = await getResponse.Content.ReadAsStringAsync();
            Console.WriteLine("Watchlist Response: " + json);

            Assert.IsTrue(json.Contains(ticker), $"Watchlist should contain the ticker '{ticker}'");
        }

        [TestMethod]
        public async Task DeleteWatchlistItem_ShouldRemoveItemSuccessfully()
        {
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

            var deleteResponse = await _client.DeleteAsync($"/api/watchlist/{created.Id}");
            Assert.AreEqual(HttpStatusCode.NoContent, deleteResponse.StatusCode, "Expected 204 NoContent from DELETE.");

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
