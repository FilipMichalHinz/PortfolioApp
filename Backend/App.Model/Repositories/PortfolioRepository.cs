using App.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    // Repository class for performing CRUD operations on Portfolio entities
    public class PortfolioRepository : BaseRepository
    {
        // Constructor receives configuration and passes it to the base repository
        public PortfolioRepository(IConfiguration configuration) : base(configuration) { }

        // Retrieves a single Portfolio by its ID from the database
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
                    // Map the data to a Portfolio object
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
                // Ensure the connection is always closed
                dbConn?.Close();
            }
        }

        // Retrieves a list of all portfolios from the database
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
                    // Iterate through each record and map to Portfolio objects
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

        // Inserts a new portfolio into the database
        // Returns true if successful and sets the generated ID back to the portfolio object
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
                    RETURNING id"; // Returns the ID of the newly inserted row

                cmd.Parameters.AddWithValue("@portfolioName", NpgsqlDbType.Text, portfolio.PortfolioName);
                cmd.Parameters.AddWithValue("@createdAt", NpgsqlDbType.Timestamp, portfolio.CreatedAt.ToLocalTime());

                dbConn.Open();
                var result = cmd.ExecuteScalar(); // Get the generated ID
                if (result != null)
                {
                    portfolio.Id = Convert.ToInt32(result);
                    return true;
                }
                return false;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Updates an existing portfolio's name based on its ID
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

        // Deletes a portfolio by its ID
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
