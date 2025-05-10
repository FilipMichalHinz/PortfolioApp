/*

Important note:

Repository methods in this project (such as PortfolioRepository.GetPortfoliosByUser)
are tightly coupled with actual PostgreSQL database access using Npgsql connections.

Because they do not abstract or separate database logic from application logic,
they cannot be unit tested effectively without setting up a real test database connection.

For that reason, we have commented out or ignored this test to avoid runtime errors like:
"Connection refused" or "Failed to connect to localhost:5432".

To test these methods in the future:
- Use a real PostgreSQL test database (e.g. via Docker)
- Or refactor the repository layer to inject a mockable data access layer

For now, we focus on testing this logic through Integration Tests instead.


using App.Model.Entities;
using App.Model.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Npgsql;
using System.Collections.Generic;

namespace App.Tests.Repositories
{
    // Summary
    // Tests for PortfolioRepository methods, focusing on retrieval logic
    // and correct mapping of database results to domain models.

    [TestClass]
    public class PortfolioRepositoryTests
    {
        private IConfiguration _config;

        [TestInitialize]
        public void Setup()
        {
            // This config provides a dummy connection string for now.
            // We'll later replace it with real or mock database handling.
            var configValues = new Dictionary<string, string>
            {
                { "ConnectionStrings:AppDb", "Host=localhost;Database=test;Username=test;Password=test" }
            };

            _config = new ConfigurationBuilder()
                .AddInMemoryCollection(configValues)
                .Build();
        }

        [TestMethod]
        public void GetPortfoliosByUser_ShouldReturnList_EvenIfEmpty()
        {
            // Arrange: Create repository instance
            var repo = new PortfolioRepository(_config);

            // For now, we'll use a userId that's unlikely to exist
            int fakeUserId = -999;

            // Act: Try to get portfolios
            var result = repo.GetPortfoliosByUser(fakeUserId);

            // Assert: Should return a non-null list (empty is okay)
            Assert.IsNotNull(result, "Returned list should not be null");
            Assert.IsInstanceOfType(result, typeof(List<Portfolio>), "Should return a List<Portfolio>");
        }
    }
}
*/
