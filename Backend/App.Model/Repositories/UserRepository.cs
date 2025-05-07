using App.Model.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    public class UserRepository : BaseRepository
    {
        private readonly PasswordHasher<User> _hasher = new();

        public UserRepository(IConfiguration configuration) : base(configuration) {}

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

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);

            return result == PasswordVerificationResult.Success ? user : null;
        }

        public string HashPassword(string password)
        {
            var dummyUser = new User();
            return _hasher.HashPassword(dummyUser, password);
        }

        // Optional: Benutzer anhand Username laden
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
