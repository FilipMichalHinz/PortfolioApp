// =============================
// File: UserRepositoryTests.cs
// Description:
// Unit test for the password hashing functionality provided by UserRepository.
// Verifies that a password hashed via HashPassword() can be successfully validated
// using Microsoft's PasswordHasher, ensuring consistency with ASP.NET Identity standards.
// =============================

using App.Model.Entities;
using App.Model.Repositories;
using Microsoft.Extensions.Configuration;

namespace App.Tests.Repositories
{
    [TestClass]
    public class UserRepositoryTests
    {
        private IConfiguration _config;

        // Initializes a mock configuration before each test.
        // This test does not require an actual database connection — only the config dependency.
        [TestInitialize]
        public void Setup()
        {
            var configValues = new Dictionary<string, string>
            {
                // Dummy connection string — not used in this test
                { "ConnectionStrings:AppDb", "Host=localhost;Database=test;Username=test;Password=test" }
            };

            _config = new ConfigurationBuilder()
                .AddInMemoryCollection(configValues)
                .Build();
        }

        [TestMethod]
        public void HashPassword_Produces_VerifiableHash()
        {
            // Arrange: Create the UserRepository instance with dummy config
            var repo = new UserRepository(_config);
            var password = "test";

            // Act: Generate a hash using the repository's hashing logic
            var hash = repo.HashPassword(password);

            // Create a dummy user to assign the hashed password
            var dummyUser = new User { PasswordHash = hash };

            // Use PasswordHasher to verify the hash matches the original password
            var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(dummyUser, dummyUser.PasswordHash, password);

            // Assert: The result must be a successful verification
            Assert.AreEqual(
                Microsoft.AspNetCore.Identity.PasswordVerificationResult.Success,
                result,
                "The hashed password should be valid and verifiable.");
        }
    }
}
