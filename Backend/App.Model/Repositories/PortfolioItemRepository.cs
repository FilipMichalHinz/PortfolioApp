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
        public List<PortfolioItem> getByPortfolio(int portfolioId)
        {
            NpgsqlConnection dbConn = null;
            var items = new List<PortfolioItem>();

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "SELECT * FROM portfolioitems WHERE portfolioid = @portfolioId";
                cmd.Parameters.AddWithValue("@portfolioId", NpgsqlDbType.Integer, portfolioId);

                var data = GetData(dbConn, cmd);
                if (data != null)
                {
                    while (data.Read())
                    {
#pragma warning disable CS8601
                        PortfolioItem item = new PortfolioItem(Convert.ToInt32(data["id"]))
                        {
                            PortfolioId = Convert.ToInt32(data["portfolioid"]),
                        
                            Ticker = data["ticker"].ToString()!,
                            Name = data["name"].ToString()!, // 🔥 Also load name
                            PurchasePrice = Convert.ToDecimal(data["purchaseprice"]),
                            Quantity = Convert.ToDecimal(data["quantity"]),
                            PurchaseDate = Convert.ToDateTime(data["purchasedate"]),
                            ExitPrice = data.IsDBNull(data.GetOrdinal("exitprice")) ? (decimal?)null : Convert.ToDecimal(data["exitprice"]),
                            ExitDate = data.IsDBNull(data.GetOrdinal("exitdate")) ? (DateTime?)null : Convert.ToDateTime(data["exitdate"]),
                            IsSold = data.IsDBNull(data.GetOrdinal("issold")) ? false : data.GetBoolean(data.GetOrdinal("issold"))
                        };
#pragma warning restore CS8601
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
                    (portfolioid,  ticker, name , purchaseprice, quantity, purchasedate) 
                    VALUES 
                    (@portfolioId,  @ticker, @name, @purchasePrice, @quantity, @purchaseDate)";

                cmd.Parameters.AddWithValue("@portfolioId", NpgsqlDbType.Integer, item.PortfolioId);
                cmd.Parameters.AddWithValue("@ticker", NpgsqlDbType.Text, item.Ticker);
                cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Text, item.Name);
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
        public bool delete(int id)
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
        public PortfolioItem? GetById(int id)
        {
            NpgsqlConnection dbConn = null;

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();

                cmd.CommandText = "SELECT * FROM portfolioitems WHERE id = @id LIMIT 1";
                cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);

                var reader = GetData(dbConn, cmd);

                if (reader != null && reader.Read())
                {
#pragma warning disable CS8601
                    return new PortfolioItem(Convert.ToInt32(reader["id"]))
                    {
                        PortfolioId = Convert.ToInt32(reader["portfolioid"]),
                     
                        Ticker = reader["ticker"].ToString(),
                        Name = reader["name"].ToString(), //  Don't forget Name field!
                        PurchasePrice = Convert.ToDecimal(reader["purchaseprice"]),
                        Quantity = Convert.ToDecimal(reader["quantity"]),
                        PurchaseDate = Convert.ToDateTime(reader["purchasedate"]),
                        ExitPrice = reader.IsDBNull(reader.GetOrdinal("exitprice")) ? (decimal?)null : Convert.ToDecimal(reader["exitprice"]),
                        ExitDate = reader.IsDBNull(reader.GetOrdinal("exitdate")) ? (DateTime?)null : Convert.ToDateTime(reader["exitdate"]),
                        IsSold = reader.GetBoolean(reader.GetOrdinal("issold"))
                    };
#pragma warning restore CS8601
                }

                return null;
            }
            finally
            {
                dbConn?.Close();
            }
        }
        public bool UpdatePortfolioItem(PortfolioItem item)
        {
            NpgsqlConnection dbConn = null;

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();

                cmd.CommandText = @"
            UPDATE portfolioitems
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

                cmd.Parameters.AddWithValue("@portfolioId", NpgsqlDbType.Integer, item.PortfolioId);
                
                cmd.Parameters.AddWithValue("@ticker", NpgsqlDbType.Text, item.Ticker);
                cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Text, item.Name);
                cmd.Parameters.AddWithValue("@purchasePrice", NpgsqlDbType.Numeric, item.PurchasePrice);
                cmd.Parameters.AddWithValue("@quantity", NpgsqlDbType.Numeric, item.Quantity);
                cmd.Parameters.AddWithValue("@purchaseDate", NpgsqlDbType.Date, item.PurchaseDate);
                cmd.Parameters.AddWithValue("@exitPrice", item.ExitPrice.HasValue ? item.ExitPrice.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@exitDate", item.ExitDate.HasValue ? item.ExitDate.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@isSold", item.IsSold);
                cmd.Parameters.AddWithValue("@id", item.Id);

                bool result = UpdateData(dbConn, cmd);
                return result;
            }
            finally
            {
                dbConn?.Close();
            }
        }

    }
}
