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
                        // Map the database fields to a Asset object
                        Asset item = new Asset(Convert.ToInt32(data["id"]))
                        {
                            PortfolioId = Convert.ToInt32(data["portfolioid"]),
                            Ticker = data["ticker"].ToString()!,
                            Name = data["name"].ToString()!,
                            PurchasePrice = Convert.ToDecimal(data["purchaseprice"]),
                            Quantity = Convert.ToDecimal(data["quantity"]),
                            PurchaseDate = Convert.ToDateTime(data["purchasedate"]),
                            ExitPrice = data.IsDBNull(data.GetOrdinal("exitprice")) ? (decimal?)null : Convert.ToDecimal(data["exitprice"]),
                            ExitDate = data.IsDBNull(data.GetOrdinal("exitdate")) ? (DateTime?)null : Convert.ToDateTime(data["exitdate"]),
                            IsSold = data.IsDBNull(data.GetOrdinal("issold")) ? false : data.GetBoolean(data.GetOrdinal("issold"))
                        };
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

        /*
        // Inserts a new Asset into the database
        public bool InsertAsset(Asset item)
        {
            NpgsqlConnection dbConn = null;
            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = @"
                    INSERT INTO assets
                    (portfolioid, ticker, name, purchaseprice, quantity, purchasedate) 
                    VALUES 
                    (@portfolioId, @ticker, @name, @purchasePrice, @quantity, @purchaseDate)";

                cmd.Parameters.AddWithValue("@portfolioId", NpgsqlDbType.Integer, item.PortfolioId);
                cmd.Parameters.AddWithValue("@ticker", NpgsqlDbType.Text, item.Ticker);
                cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Text, item.Name);
                cmd.Parameters.AddWithValue("@purchasePrice", NpgsqlDbType.Numeric, item.PurchasePrice);
                cmd.Parameters.AddWithValue("@quantity", NpgsqlDbType.Numeric, item.Quantity);
                cmd.Parameters.AddWithValue("@purchaseDate", NpgsqlDbType.Date, item.PurchaseDate);

                return InsertData(dbConn, cmd);
            }
            finally
            {
                dbConn?.Close();
            }
        }
        */

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


        // Deletes a Asset by its ID
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

        // Retrieves a Asset by its ticker (symbol)
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

        // Retrieves a Asset by its ID
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
                        ExitPrice = reader.IsDBNull(reader.GetOrdinal("exitprice")) ? (decimal?)null : Convert.ToDecimal(reader["exitprice"]),
                        ExitDate = reader.IsDBNull(reader.GetOrdinal("exitdate")) ? (DateTime?)null : Convert.ToDateTime(reader["exitdate"]),
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

        // Updates all fields of a Asset, including sale-related data
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

        // Updates only basic item details (not sale-related fields)
        public bool UpdateAssetDetails(Asset item)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            conn.Open();

            var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                UPDATE assets
                SET ticker = @ticker,
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
