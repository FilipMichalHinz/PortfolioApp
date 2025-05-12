// =============================
// File: UserRepository.cs
// Description:
// Provides methods to retrieve and authenticate users stored in the database.
// Uses ASP.NET Core Identity's PasswordHasher to handle secure password hashing and verification.
// This repository supports login functionality and user lookups by username.
// =============================

using App.Model.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    public class UserRepository : BaseRepository
    {
        // PasswordHasher used for hashing and verifying passwords according to ASP.NET Core Identity standards
        private readonly PasswordHasher<User> _hasher = new();

        public UserRepository(IConfiguration configuration) : base(configuration) {}

        // Attempts to find a user by username and validate the provided password.
        // Returns the User object if credentials are valid; otherwise returns null.
        public User? GetByCredentials(string username, string password)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            conn.Open();

            var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT * FROM users WHERE username = @username LIMIT 1";
            cmd.Parameters.AddWithValue("@username", NpgsqlDbType.Text, username);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read()) return null;

            var user = new User
            {
                Id = Convert.ToInt32(reader["id"]),
                Username = reader["username"].ToString()!,
                PasswordHash = reader["password_hash"].ToString()!
            };

            // Verifies that the provided password matches the stored hashed password
            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);

            return result == PasswordVerificationResult.Success ? user : null;
        }

        // Hashes a plaintext password using ASP.NET Core Identity password hashing
        // Used during registration or when changing a user's password
        public string HashPassword(string password)
        {
            var dummyUser = new User();
            return _hasher.HashPassword(dummyUser, password);
        }

        // Retrieves a user by username (used for validation, e.g., during registration to prevent duplicates)
        public User? GetByUsername(string username)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            conn.Open();

            var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT * FROM users WHERE username = @username LIMIT 1";
            cmd.Parameters.AddWithValue("@username", NpgsqlDbType.Text, username);

            using var reader = cmd.ExecuteReader();
            if (!reader.Read()) return null;

            return new User
            {
                Id = Convert.ToInt32(reader["id"]),
                Username = reader["username"].ToString()!,
                PasswordHash = reader["password_hash"].ToString()!
            };
        }
    }
}
