// =============================
// File: WatchlistRepository.cs
// Description:
// Handles all data access operations for the Watchlist entity, using PostgreSQL via Npgsql.
// Supports CRUD operations with user-specific access control to ensure ownership-based data access.
// Inherits shared DB logic from BaseRepository.
// =============================

using App.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    public class WatchlistRepository : BaseRepository
    {
        public WatchlistRepository(IConfiguration configuration) : base(configuration) { }

        // Retrieves all watchlist items for a specific user
        public List<Watchlist> GetWatchlistByUser(int userId)
        {
            var watchlist = new List<Watchlist>();

            using var conn = new NpgsqlConnection(ConnectionString);
            conn.Open();

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT id, userid, ticker, assetname, targetprice
                FROM watchlists
                WHERE userid = @userId";
            cmd.Parameters.AddWithValue("@userId", userId);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                var item = new Watchlist(reader.GetInt32(reader.GetOrdinal("id")))
                {
                    UserId = reader.GetInt32(reader.GetOrdinal("userid")),
                    Ticker = reader.GetString(reader.GetOrdinal("ticker")),
                    AssetName = reader.GetString(reader.GetOrdinal("assetname")),
                    TargetPrice = reader.GetDecimal(reader.GetOrdinal("targetprice"))
                };
                watchlist.Add(item);
            }

            return watchlist;
        }

        // Inserts a new watchlist item into the database
        public bool InsertWatchlistItem(Watchlist item)
        {
            using var dbConn = new NpgsqlConnection(ConnectionString);
            using var cmd = dbConn.CreateCommand();

            cmd.CommandText = @"
                INSERT INTO watchlists 
                    (userid, ticker, assetname, targetprice) 
                VALUES 
                    (@userId, @ticker, @assetName, @targetPrice)";

            cmd.Parameters.AddWithValue("@userId", NpgsqlDbType.Integer, item.UserId);
            cmd.Parameters.AddWithValue("@ticker", NpgsqlDbType.Text, item.Ticker);
            cmd.Parameters.AddWithValue("@assetName", NpgsqlDbType.Text, item.AssetName);
            cmd.Parameters.AddWithValue("@targetPrice", NpgsqlDbType.Numeric, item.TargetPrice);

            return InsertData(dbConn, cmd);
        }

        // Updates the target price of a watchlist item for a given user
        public bool UpdateWatchlistItem(Watchlist item, int userId)
        {
            using var dbConn = new NpgsqlConnection(ConnectionString);
            //dbConn.Open();

            using var cmd = dbConn.CreateCommand();
            cmd.CommandText = @"
                UPDATE watchlists
                SET targetprice = @targetPrice
                WHERE id = @id AND userid = @userId"; // Ensures user cannot update another user's item

            cmd.Parameters.AddWithValue("@targetPrice", NpgsqlDbType.Numeric, item.TargetPrice);
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, item.Id);
            cmd.Parameters.AddWithValue("@userId", NpgsqlDbType.Integer, userId);

            return UpdateData(dbConn, cmd);
        }

        // Deletes a watchlist item by ID (no user check – should be handled at controller level)
        public bool DeleteWatchlistItem(int id)
        {
            using var dbConn = new NpgsqlConnection(ConnectionString);
            using var cmd = dbConn.CreateCommand();

            cmd.CommandText = "DELETE FROM watchlists WHERE id = @id";
            cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);

            return DeleteData(dbConn, cmd);
        }

        // Retrieves a specific watchlist item by ID and user ID (ownership check included)
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
