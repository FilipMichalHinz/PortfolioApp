// =============================
// File: AssetRepository.cs
// Description:
// Manages database operations for the Asset entity. Supports full CRUD functionality,
// as well as methods to filter assets by portfolio, lookup by ticker, and selectively
// update either investment or sales information.
// Inherits database utility functions from BaseRepository.
// =============================

using App.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    // Repository class responsible for managing Asset entities in the database
    public class AssetRepository : BaseRepository
    {
        public AssetRepository(IConfiguration configuration) : base(configuration) { }

        // Retrieves all assets belonging to a specific portfolio
        public List<Asset> GetByPortfolio(int portfolioId)
        {
            NpgsqlConnection dbConn = null;
            var items = new List<Asset>();

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "SELECT * FROM assets WHERE portfolioid = @portfolioId";
                cmd.Parameters.AddWithValue("@portfolioId", NpgsqlDbType.Integer, portfolioId);

                var data = GetData(dbConn, cmd);
                if (data != null)
                {
                    while (data.Read())
                    {
                        items.Add(new Asset(Convert.ToInt32(data["id"]))
                        {
                            PortfolioId = Convert.ToInt32(data["portfolioid"]),
                            Ticker = data["ticker"].ToString()!,
                            Name = data["name"].ToString()!,
                            PurchasePrice = Convert.ToDecimal(data["purchaseprice"]),
                            Quantity = Convert.ToDecimal(data["quantity"]),
                            PurchaseDate = Convert.ToDateTime(data["purchasedate"]),
                            ExitPrice = data.IsDBNull(data.GetOrdinal("exitprice")) ? null : Convert.ToDecimal(data["exitprice"]),
                            ExitDate = data.IsDBNull(data.GetOrdinal("exitdate")) ? null : Convert.ToDateTime(data["exitdate"]),
                            IsSold = data.IsDBNull(data.GetOrdinal("issold")) ? false : data.GetBoolean(data.GetOrdinal("issold"))
                        });
                    }
                }
                return items;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Inserts a new asset and returns the inserted object with its new ID
        public Asset? InsertAssetAndReturn(Asset item)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO assets (portfolioid, ticker, name, purchaseprice, quantity, purchasedate)
                VALUES (@portfolioId, @ticker, @name, @purchasePrice, @quantity, @purchaseDate)
                RETURNING id";

            cmd.Parameters.AddWithValue("@portfolioId", item.PortfolioId);
            cmd.Parameters.AddWithValue("@ticker", item.Ticker);
            cmd.Parameters.AddWithValue("@name", item.Name);
            cmd.Parameters.AddWithValue("@purchasePrice", item.PurchasePrice);
            cmd.Parameters.AddWithValue("@quantity", item.Quantity);
            cmd.Parameters.AddWithValue("@purchaseDate", item.PurchaseDate);

            conn.Open();
            var id = cmd.ExecuteScalar();
            if (id != null)
            {
                item.Id = Convert.ToInt32(id);
                return item;
            }

            return null;
        }

        // Deletes an asset by ID
        public bool DeleteAsset(int id)
        {
            NpgsqlConnection dbConn = null;
            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "DELETE FROM assets WHERE id = @id";
                cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);

                return DeleteData(dbConn, cmd);
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Retrieves a single asset by its ticker symbol
        public Asset? GetByTicker(string ticker)
        {
            NpgsqlConnection dbConn = null;

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "SELECT * FROM assets WHERE ticker = @ticker LIMIT 1";
                cmd.Parameters.AddWithValue("@ticker", NpgsqlDbType.Text, ticker);

                var reader = GetData(dbConn, cmd);

                if (reader != null && reader.Read())
                {
                    return new Asset(Convert.ToInt32(reader["id"]))
                    {
                        PortfolioId = Convert.ToInt32(reader["portfolioid"]),
                        Ticker = reader["ticker"].ToString(),
                        PurchasePrice = Convert.ToDecimal(reader["purchaseprice"]),
                        Quantity = Convert.ToDecimal(reader["quantity"]),
                        PurchaseDate = Convert.ToDateTime(reader["purchasedate"])
                    };
                }

                return null;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Retrieves an asset by its internal ID
        public Asset? GetById(int id)
        {
            NpgsqlConnection dbConn = null;

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "SELECT * FROM assets WHERE id = @id LIMIT 1";
                cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);

                var reader = GetData(dbConn, cmd);

                if (reader != null && reader.Read())
                {
                    return new Asset(Convert.ToInt32(reader["id"]))
                    {
                        PortfolioId = Convert.ToInt32(reader["portfolioid"]),
                        Ticker = reader["ticker"].ToString(),
                        Name = reader["name"].ToString(),
                        PurchasePrice = Convert.ToDecimal(reader["purchaseprice"]),
                        Quantity = Convert.ToDecimal(reader["quantity"]),
                        PurchaseDate = Convert.ToDateTime(reader["purchasedate"]),
                        ExitPrice = reader.IsDBNull(reader.GetOrdinal("exitprice")) ? null : Convert.ToDecimal(reader["exitprice"]),
                        ExitDate = reader.IsDBNull(reader.GetOrdinal("exitdate")) ? null : Convert.ToDateTime(reader["exitdate"]),
                        IsSold = reader.GetBoolean(reader.GetOrdinal("issold"))
                    };
                }

                return null;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Updates all fields of an asset, including sale info (ExitPrice, ExitDate, IsSold)
        public bool UpdateAsset(Asset item)
        {
            NpgsqlConnection dbConn = null;

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = @"
                    UPDATE assets
                    SET
                        portfolioid = @portfolioId,
                        ticker = @ticker,
                        name = @name,
                        purchaseprice = @purchasePrice,
                        quantity = @quantity,
                        purchasedate = @purchaseDate,
                        exitprice = @exitPrice,
                        exitdate = @exitDate,
                        issold = @isSold
                    WHERE id = @id";

                cmd.Parameters.AddWithValue("@portfolioId", item.PortfolioId);
                cmd.Parameters.AddWithValue("@ticker", item.Ticker);
                cmd.Parameters.AddWithValue("@name", item.Name);
                cmd.Parameters.AddWithValue("@purchasePrice", item.PurchasePrice);
                cmd.Parameters.AddWithValue("@quantity", item.Quantity);
                cmd.Parameters.AddWithValue("@purchaseDate", item.PurchaseDate);
                cmd.Parameters.AddWithValue("@exitPrice", item.ExitPrice.HasValue ? item.ExitPrice.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@exitDate", item.ExitDate.HasValue ? item.ExitDate.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@isSold", item.IsSold);
                cmd.Parameters.AddWithValue("@id", item.Id);

                return UpdateData(dbConn, cmd);
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Updates core asset info only (no sale tracking fields)
        public bool UpdateAssetDetails(Asset item)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            conn.Open();

            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                UPDATE assets
                SET 
                    ticker = @ticker,
                    name = @name,
                    purchaseprice = @purchasePrice,
                    quantity = @quantity,
                    purchasedate = @purchaseDate
                WHERE id = @id";

            cmd.Parameters.AddWithValue("@id", item.Id);
            cmd.Parameters.AddWithValue("@ticker", item.Ticker);
            cmd.Parameters.AddWithValue("@name", item.Name);
            cmd.Parameters.AddWithValue("@purchasePrice", item.PurchasePrice);
            cmd.Parameters.AddWithValue("@quantity", item.Quantity);
            cmd.Parameters.AddWithValue("@purchaseDate", item.PurchaseDate);

            return cmd.ExecuteNonQuery() == 1;
        }
    }
}
