using App.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    // Repository class responsible for CRUD operations on the 'watchlist' table
    public class WatchlistRepository : BaseRepository
    {
        public WatchlistRepository(IConfiguration configuration) : base(configuration) { }

        // Retrieves all watchlist items for a specific user
        public List<Watchlist> GetWatchlistByUser(int userId)
        {
            var watchlist = new List<Watchlist>();
            using var dbConn = new NpgsqlConnection(ConnectionString);
            dbConn.Open();

            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "SELECT * FROM watchlists WHERE userid = @userId";
            cmd.Parameters.AddWithValue("@userId", NpgsqlDbType.Integer, userId);

            var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                Watchlist item = new Watchlist(Convert.ToInt32(reader["id"]))
                {
                    UserId = Convert.ToInt32(reader["userid"]),
                    AssetName = reader["assetname"].ToString(),
                    TargetPrice = Convert.ToDecimal(reader["targetprice"])
                };
                watchlist.Add(item);
            }

            return watchlist;
        }

        // Retrieves a single watchlist item by ID
        public Watchlist? GetById(int id)
        {
            using var dbConn = new NpgsqlConnection(ConnectionString);
            dbConn.Open();

            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "SELECT * FROM watchlists WHERE id = @id";
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);

            var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new Watchlist(Convert.ToInt32(reader["id"]))
                {
                    UserId = Convert.ToInt32(reader["userid"]),
                    AssetName = reader["assetname"].ToString(),
                    TargetPrice = Convert.ToDecimal(reader["targetprice"])
                };
            }

            return null;
        }

        // Inserts a new watchlist item
        public bool InsertWatchlistItem(Watchlist item)
        {
            using var dbConn = new NpgsqlConnection(ConnectionString);
            dbConn.Open();

            var cmd = dbConn.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO watchlists (userid, assetname, targetprice) 
                VALUES (@userId, @assetName, @targetPrice)";
            cmd.Parameters.AddWithValue("@userId", item.UserId);
            cmd.Parameters.AddWithValue("@assetName", item.AssetName);
            cmd.Parameters.AddWithValue("@targetPrice", item.TargetPrice);

            return cmd.ExecuteNonQuery() == 1;
        }

        // Deletes a watchlist item by ID
        public bool DeleteWatchlistItem(int id)
        {
            using var dbConn = new NpgsqlConnection(ConnectionString);
            dbConn.Open();

            var cmd = dbConn.CreateCommand();
            cmd.CommandText = "DELETE FROM watchlists WHERE id = @id";
            cmd.Parameters.AddWithValue("@id", id);

            return cmd.ExecuteNonQuery() == 1;
        }
    }
}
