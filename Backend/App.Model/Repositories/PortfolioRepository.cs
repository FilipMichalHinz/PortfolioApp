using App.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    public class PortfolioRepository : BaseRepository
    {
        public PortfolioRepository(IConfiguration configuration) : base(configuration) { }

        // Neu: Portfolios nach UserId filtern
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

        public bool InsertPortfolio(Portfolio portfolio)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO portfolios (name, createdat, userid) 
                VALUES (@Name, @createdAt, @userId)
                RETURNING id";

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

        public bool UpdatePortfolio(Portfolio portfolio)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                UPDATE portfolios SET 
                    name = @Name
                WHERE id = @id AND userid = @userId";

            cmd.Parameters.AddWithValue("@Name", NpgsqlDbType.Text, portfolio.Name);
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, portfolio.Id);
            cmd.Parameters.AddWithValue("@userId", NpgsqlDbType.Integer, portfolio.UserId);

            return UpdateData(conn, cmd);
        }

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
