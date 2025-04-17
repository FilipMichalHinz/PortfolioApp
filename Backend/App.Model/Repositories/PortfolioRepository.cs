using App.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    public class PortfolioRepository : BaseRepository
    {
        public PortfolioRepository(IConfiguration configuration) : base(configuration) { }

        public Portfolio GetPortfolioById(int id)
        {
            NpgsqlConnection dbConn = null;
            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "SELECT * FROM portfolios WHERE id = @id";
                cmd.Parameters.Add("@id", NpgsqlDbType.Integer).Value = id;

                var data = GetData(dbConn, cmd);
                if (data != null && data.Read())
                {
                    return new Portfolio(Convert.ToInt32(data["id"]))
                    {
                        PortfolioName = data["name"].ToString(),
                        CreatedAt = Convert.ToDateTime(data["createdat"])
                    };
                }
                return null;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        public List<Portfolio> GetPortfolios()
        {
            NpgsqlConnection dbConn = null;
            var portfolios = new List<Portfolio>();

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "SELECT * FROM portfolios";

                var data = GetData(dbConn, cmd);
                if (data != null)
                {
                    while (data.Read())
                    {
                        Portfolio portfolio = new Portfolio(Convert.ToInt32(data["id"]))
                        {
                            PortfolioName = data["name"].ToString(),
                            CreatedAt = Convert.ToDateTime(data["createdat"])
                        };
                        portfolios.Add(portfolio);
                    }
                }
                return portfolios;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Add new Portfolio
       public bool InsertPortfolio(Portfolio portfolio)
        {
            NpgsqlConnection dbConn = null;
            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = @"
                    INSERT INTO portfolios (name, createdat) 
                    VALUES (@portfolioName, @createdAt)
                    RETURNING id";

                cmd.Parameters.AddWithValue("@portfolioName", NpgsqlDbType.Text, portfolio.PortfolioName);
                cmd.Parameters.AddWithValue("@createdAt", NpgsqlDbType.Timestamp, portfolio.CreatedAt.ToLocalTime());

                dbConn.Open();
                var result = cmd.ExecuteScalar();
                if (result != null)
                {
                    portfolio.Id = Convert.ToInt32(result); // ← neue ID setzen
                    return true;
                }
                return false;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        public bool UpdatePortfolio(Portfolio portfolio)
        {
            NpgsqlConnection dbConn = null;
            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = @"
                    UPDATE portfolios SET 
                        name = @portfolioName
                        
                    WHERE id = @id";

                cmd.Parameters.AddWithValue("@portfolioName", NpgsqlDbType.Text, portfolio.PortfolioName);
                cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, portfolio.Id);

                return UpdateData(dbConn, cmd);
            }
            finally
            {
                dbConn?.Close();
            }
        }

        public bool DeletePortfolio(int id)
        {
            NpgsqlConnection dbConn = null;
            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "DELETE FROM portfolios WHERE id = @id";
                cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);

                return DeleteData(dbConn, cmd);
            }
            finally
            {
                dbConn?.Close();
            }
        }
    }
}
