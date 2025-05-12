// =============================
// File: PortfolioRepository.cs
// Description:
// Provides data access logic for Portfolio entities using PostgreSQL (via Npgsql).
// Supports full CRUD operations and ensures that user-specific access rules are enforced.
// Inherits common DB helper logic from BaseRepository.
// =============================

using App.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    public class PortfolioRepository : BaseRepository
    {
        public PortfolioRepository(IConfiguration configuration) : base(configuration) { }

        // Retrieves all portfolios owned by a specific user
        public List<Portfolio> GetPortfoliosByUser(int userId)
        {
            var portfolios = new List<Portfolio>();

            using var conn = new NpgsqlConnection(ConnectionString);
            var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT * FROM portfolios WHERE userid = @userId";
            cmd.Parameters.AddWithValue("@userId", NpgsqlDbType.Integer, userId);

            var data = GetData(conn, cmd);
            while (data.Read())
            {
                portfolios.Add(new Portfolio(Convert.ToInt32(data["id"]))
                {
                    Name = data["name"].ToString(),
                    CreatedAt = Convert.ToDateTime(data["createdat"]),
                    UserId = Convert.ToInt32(data["userid"])
                });
            }

            return portfolios;
        }

        // Retrieves a specific portfolio by ID, only if it belongs to the given user
        public Portfolio GetPortfolioById(int id, int userId)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT * FROM portfolios WHERE id = @id AND userid = @userId";
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
            cmd.Parameters.AddWithValue("@userId", NpgsqlDbType.Integer, userId);

            var data = GetData(conn, cmd);
            if (data.Read())
            {
                return new Portfolio(Convert.ToInt32(data["id"]))
                {
                    Name = data["name"].ToString(),
                    CreatedAt = Convert.ToDateTime(data["createdat"]),
                    UserId = Convert.ToInt32(data["userid"])
                };
            }

            return null;
        }

        // Retrieves a portfolio by ID without user ownership check (used internally or with prior validation)
        public Portfolio GetPortfolioById(int id)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT * FROM portfolios WHERE id = @id";
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);

            var data = GetData(conn, cmd);
            if (data.Read())
            {
                return new Portfolio(Convert.ToInt32(data["id"]))
                {
                    Name = data["name"].ToString(),
                    CreatedAt = Convert.ToDateTime(data["createdat"]),
                    UserId = Convert.ToInt32(data["userid"])
                };
            }

            return null;
        }

        // Inserts a new portfolio and assigns the generated ID to the portfolio object
        public bool InsertPortfolio(Portfolio portfolio)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO portfolios (name, createdat, userid) 
                VALUES (@Name, @createdAt, @userId)
                RETURNING id"; // Returns the generated ID

            cmd.Parameters.AddWithValue("@Name", NpgsqlDbType.Text, portfolio.Name);
            cmd.Parameters.AddWithValue("@createdAt", NpgsqlDbType.Timestamp, portfolio.CreatedAt.ToLocalTime());
            cmd.Parameters.AddWithValue("@userId", NpgsqlDbType.Integer, portfolio.UserId);

            conn.Open();
            var result = cmd.ExecuteScalar();
            if (result != null)
            {
                portfolio.Id = Convert.ToInt32(result);
                return true;
            }

            return false;
        }

        // Updates the name of a portfolio, enforcing user ownership
        public bool UpdatePortfolio(Portfolio portfolio)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                UPDATE portfolios SET 
                    name = @Name
                WHERE id = @id AND userid = @userId"; // Prevents updates on others' portfolios

            cmd.Parameters.AddWithValue("@Name", NpgsqlDbType.Text, portfolio.Name);
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, portfolio.Id);
            cmd.Parameters.AddWithValue("@userId", NpgsqlDbType.Integer, portfolio.UserId);

            return UpdateData(conn, cmd);
        }

        // Deletes a portfolio by ID (access control must be ensured by caller)
        public bool DeletePortfolio(int id)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            var cmd = conn.CreateCommand();
            cmd.CommandText = "DELETE FROM portfolios WHERE id = @id";
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);

            return DeleteData(conn, cmd);
        }
    }
}
