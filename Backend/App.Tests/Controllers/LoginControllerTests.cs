// =============================
// File: LoginControllerTests.cs
// Description:
// Integration tests for the /api/login endpoint.
// These tests verify correct authentication behavior using real controller,
// middleware, and repository components under test conditions.
// =============================

using System.Net;
using System.Net.Http.Json;
using App.API;
using Microsoft.AspNetCore.Mvc.Testing;
using App.Tests.Models;

namespace App.Tests.Controllers
{
    [TestClass]
    public class LoginControllerTests
    {
        private HttpClient _client;

        [TestInitialize]
        public void Setup()
        {
            // Create a test server with the full API pipeline
            var factory = new WebApplicationFactory<Program>();
            _client = factory.CreateClient();
        }

        [TestMethod]
        public async Task Login_WithValidCredentials_ReturnsOkAndAuthHeader()
        {
            // Arrange: Known user credentials (must exist in seeded test DB)
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "password"
            };

            // Act: Send POST to /api/login
            var response = await _client.PostAsJsonAsync("/api/login", loginPayload);

            // Assert: Expect HTTP 200 and a valid response body
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode, "Expected 200 OK for valid credentials.");

            var result = await response.Content.ReadFromJsonAsync<LoginResponse>();

            Assert.IsNotNull(result, "Response should be deserializable.");
            Assert.IsNotNull(result.AuthHeader, "authHeader should be returned.");
            Assert.AreEqual("alice", result.Username, "Returned username should match input.");
        }

        [TestMethod]
        public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange: Incorrect password
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "wrongpassword"
            };

            // Act: Send login request
            var response = await _client.PostAsJsonAsync("/api/login", loginPayload);

            // Assert: Expect 401 Unauthorized
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode, "Expected 401 Unauthorized for invalid login.");
        }
    }
}
