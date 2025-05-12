/*
===================================================================================
 File: PortfolioRepositoryTests.cs (currently disabled)

 Summary:
 This file contains a test class for PortfolioRepository, specifically targeting
 methods like GetPortfoliosByUser(). These methods directly access a real PostgreSQL
 database using Npgsql and are not abstracted for mocking.

 Important Note:
 Because the repository tightly couples business logic and database,
 these methods cannot be unit-tested in isolation without an actual database connection.

 Attempting to run these tests without a live PostgreSQL instance will result in:
 - Connection refused
 - Authentication failure
 - Other Npgsql runtime exceptions

 Meanwhile, integration tests are the correct and preferred testing approach
 for repository-level functionality in this project.
===================================================================================

using App.Model.Entities;
using App.Model.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;

namespace App.Tests.Repositories
{
    [TestClass]
    public class PortfolioRepositoryTests
    {
        private IConfiguration _config;

        [TestInitialize]
        public void Setup()
        {
            // Setup with dummy configuration. No actual DB connection is made.
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
            // This will fail at runtime unless a real DB is available.

            var repo = new PortfolioRepository(_config);
            int fakeUserId = -999;

            var result = repo.GetPortfoliosByUser(fakeUserId);

            Assert.IsNotNull(result, "Returned list should not be null");
            Assert.IsInstanceOfType(result, typeof(List<Portfolio>), "Should return a List<Portfolio>");
        }
    }
}
*/
