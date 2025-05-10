using System.Net;
using System.Net.Http.Json;
using App.API;
using Microsoft.AspNetCore.Mvc.Testing;
using App.Tests.Models;

namespace App.Tests.Controllers
{
    /// <summary>
    /// Integration tests for the LoginController.
    /// This test sends real HTTP requests to a test server using the actual middleware,
    /// controller, and repository logic. It validates successful and failed logins.
    /// </summary>
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
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "password"
            };

            var response = await _client.PostAsJsonAsync("/api/login", loginPayload);

            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode, "Expected 200 OK for valid credentials.");

            // Deserialize response into strongly typed object
            var result = await response.Content.ReadFromJsonAsync<LoginResponse>();

            // Assert result
            Assert.IsNotNull(result);
            Assert.IsNotNull(result.AuthHeader, "authHeader should be returned.");
            Assert.AreEqual("alice", result.Username, "Returned username should match input.");
        }


        [TestMethod]
        public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange: Wrong password
            var loginPayload = new Login
            {
                Username = "alice",
                Password = "wrongpassword"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/login", loginPayload);

            // Assert
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode, "Expected 401 Unauthorized for invalid login.");
        }
    }
}
