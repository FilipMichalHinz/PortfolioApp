using App.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    public class WatchlistRepository : BaseRepository
    {
        public WatchlistRepository(IConfiguration configuration) : base(configuration) { }

        public List<Watchlist> GetWatchlistByUser(int userId)
        {
           
            var watchlist = new List<Watchlist>();

            // create and open connection
            using var conn = new NpgsqlConnection(ConnectionString);
            conn.Open();
                
            // create SQL command
            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
            SELECT id, userid, ticker, assetname, targetprice
            FROM watchlists
            WHERE userid = @userId";
            cmd.Parameters.AddWithValue("@userId", userId);

            //Execute and map data
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                var item = new Watchlist(reader.GetInt32(reader.GetOrdinal("id")))
                {        
                    UserId = reader.GetInt32(reader.GetOrdinal("userid")),// Check this after login functionality
                    Ticker = reader.GetString(reader.GetOrdinal("ticker")),
                    AssetName = reader.GetString(reader.GetOrdinal("assetname")),
                    TargetPrice = reader.GetDecimal(reader.GetOrdinal("targetprice"))
                };
                watchlist.Add(item);
            }
                
            return watchlist;
            
        }

        // Add new Watchlist item
        public bool InsertWatchlistItem(Watchlist item)
        {
            
            using var dbConn = new NpgsqlConnection(ConnectionString);
            using var  cmd = dbConn.CreateCommand();

             
            cmd.CommandText = @"
                    INSERT INTO watchlists 
                    (userid, ticker, assetname, targetprice) 
                    VALUES 
                    (@userId, @ticker, @assetName, @targetPrice)";

                cmd.Parameters.AddWithValue("@userId", NpgsqlDbType.Integer, item.UserId); // Will likely not be here
                cmd.Parameters.AddWithValue("@ticker", NpgsqlDbType.Text, item.Ticker);
                cmd.Parameters.AddWithValue("@assetName", NpgsqlDbType.Text, item.AssetName);
                cmd.Parameters.AddWithValue("@targetPrice", NpgsqlDbType.Numeric, item.TargetPrice);

                return InsertData(dbConn, cmd); // Check if the item was inserted successfully
            
        }

        public bool UpdateWatchlistItem(Watchlist item, int userId)
        {
            using var dbConn = new NpgsqlConnection(ConnectionString);
            //dbConn.Open();

            using var cmd = dbConn.CreateCommand();
            cmd.CommandText = @"
                UPDATE watchlists
                SET targetprice = @targetPrice
                WHERE id = @id AND userid = @userId";  // ✅ stellt sicher, dass nur eigene Einträge geändert werden

            cmd.Parameters.AddWithValue("@targetPrice", NpgsqlDbType.Numeric, item.TargetPrice);
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, item.Id);
            cmd.Parameters.AddWithValue("@userId", NpgsqlDbType.Integer, userId);

            return UpdateData(dbConn, cmd);
        }


        public bool DeleteWatchlistItem(int id)
        {
            
            using var dbConn = new NpgsqlConnection(ConnectionString);
            using var cmd = dbConn.CreateCommand();

            cmd.CommandText = "DELETE FROM watchlists WHERE id = @id";
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);

                //bool result = DeleteData(dbConn, cmd);
                return DeleteData(dbConn, cmd); // Check if the item was deleted successfully
            
        }

        // Get a specific watchlist item by ID
        //used for updating a single item

        /*
        public Watchlist? GetWatchlistItemById(int id)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT id, userid, ticker, assetname, targetprice
                FROM watchlists
                WHERE id = @id";
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);

            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                var item = new Watchlist(reader.GetInt32(reader.GetOrdinal("id")))
                {
                    UserId = reader.GetInt32(reader.GetOrdinal("userid")),
                    Ticker = reader.GetString(reader.GetOrdinal("ticker")),
                    AssetName = reader.GetString(reader.GetOrdinal("assetname")),
                    TargetPrice = reader.GetDecimal(reader.GetOrdinal("targetprice"))
                };
                return item;
            }

            return null;
        }
        */

        public Watchlist? GetWatchlistItemById(int id, int userId)
        {
            using var conn = new NpgsqlConnection(ConnectionString);
            conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT id, userid, ticker, assetname, targetprice
                FROM watchlists
                WHERE id = @id AND userid = @userId";
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);
            cmd.Parameters.AddWithValue("@userId", NpgsqlDbType.Integer, userId);

            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new Watchlist(reader.GetInt32(reader.GetOrdinal("id")))
                {
                    UserId = reader.GetInt32(reader.GetOrdinal("userid")),
                    Ticker = reader.GetString(reader.GetOrdinal("ticker")),
                    AssetName = reader.GetString(reader.GetOrdinal("assetname")),
                    TargetPrice = reader.GetDecimal(reader.GetOrdinal("targetprice"))
                };
            }

            return null;
        }

    }
}
