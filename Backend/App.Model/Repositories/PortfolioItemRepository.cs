using App.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    public class PortfolioItemRepository : BaseRepository
    {
        public PortfolioItemRepository(IConfiguration configuration) : base(configuration) { }

        // Get all portfolio items for a specific user
        public List<PortfolioItem> GetPortfolioItemsByPortfolio(int portfolioIdId)
        {
            NpgsqlConnection dbConn = null;
            var items = new List<PortfolioItem>();

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "SELECT * FROM portfolioitems WHERE portfolioid = @portfolioId";
                cmd.Parameters.AddWithValue("@portfolioId", NpgsqlDbType.Integer, portfolioIdId);

                var data = GetData(dbConn, cmd);
                if (data != null)
                {
                    while (data.Read())
                    {
#pragma warning disable CS8601 // Possible null reference assignment.
                        PortfolioItem item = new PortfolioItem(Convert.ToInt32(data["id"]))
                        {
                            PortfolioId = Convert.ToInt32(data["portfolioid"]),
                            AssetTypeId = Convert.ToInt32(data["assettypeid"]),
                            Ticker = data["ticker"].ToString(),
                            PurchasePrice = Convert.ToDecimal(data["purchaseprice"]),
                            Quantity = Convert.ToDecimal(data["quantity"]),
                            PurchaseDate = Convert.ToDateTime(data["purchasedate"])
                        };
#pragma warning restore CS8601 // Possible null reference assignment.
                        items.Add(item);
                    }
                }
                return items;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Add a new portfolio item
        public bool InsertPortfolioItem(PortfolioItem item)
        {
            NpgsqlConnection dbConn = null;
            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = @"
                    INSERT INTO portfolioitems 
                    (portfolioid, assettypeid, ticker, purchaseprice, quantity, purchasedate) 
                    VALUES 
                    (@portfolioId, @assetTypeId, @ticker, @purchasePrice, @quantity, @purchaseDate)";

                cmd.Parameters.AddWithValue("@portfolioId", NpgsqlDbType.Integer, item.PortfolioId);
                cmd.Parameters.AddWithValue("@assetTypeId", NpgsqlDbType.Integer, item.AssetTypeId);
                cmd.Parameters.AddWithValue("@ticker", NpgsqlDbType.Text, item.Ticker);
                cmd.Parameters.AddWithValue("@purchasePrice", NpgsqlDbType.Numeric, item.PurchasePrice);
                cmd.Parameters.AddWithValue("@quantity", NpgsqlDbType.Numeric, item.Quantity);
                cmd.Parameters.AddWithValue("@purchaseDate", NpgsqlDbType.Date, item.PurchaseDate);

                bool result = InsertData(dbConn, cmd);
                return result;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Delete a portfolio item by ID
        public bool DeletePortfolioItem(int id)
        {
            NpgsqlConnection dbConn = null;
            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "DELETE FROM portfolioitems WHERE id = @id";
                cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);

                bool result = DeleteData(dbConn, cmd);
                return result;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Get a single portfolio item by its name (ticker)
        public PortfolioItem? GetByTicker(string ticker)
        {
            NpgsqlConnection dbConn = null;

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();

                cmd.CommandText = "SELECT * FROM portfolioitems WHERE TICKER = @ticker LIMIT 1";
                cmd.Parameters.AddWithValue("@ticker", NpgsqlDbType.Text, ticker);

                var reader = GetData(dbConn, cmd);

                if (reader != null && reader.Read())
                {
#pragma warning disable CS8601 // Possible null reference assignment.
                    return new PortfolioItem(Convert.ToInt32(reader["id"]))
                    {
                        PortfolioId = Convert.ToInt32(reader["portfolioid"]),
                        AssetTypeId = Convert.ToInt32(reader["assettypeid"]),
                        Ticker = reader["ticker"].ToString(),
                        PurchasePrice = Convert.ToDecimal(reader["purchaseprice"]),
                        Quantity = Convert.ToDecimal(reader["quantity"]),
                        PurchaseDate = Convert.ToDateTime(reader["purchasedate"])
                    };
#pragma warning restore CS8601 // Possible null reference assignment.
                }

                return null;
            }
            finally
            {
                dbConn?.Close();
            }
        }
    }
}
