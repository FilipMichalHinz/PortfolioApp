using App.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    public class WatchlistRepository : BaseRepository
    {
        public WatchlistRepository(IConfiguration configuration) : base(configuration) { }

        public List<Watchlist> GetWatchlistByPortfolio(int portfolioId)
        {
            NpgsqlConnection dbConn = null;
            var watchlist = new List<Watchlist>();

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "SELECT * FROM watchlist WHERE portfolioid = @portfolioId";
                cmd.Parameters.AddWithValue("@portfolioId", NpgsqlDbType.Integer, portfolioId);

                var data = GetData(dbConn, cmd);
                if (data != null)
                {
                    while (data.Read())
                    {
                        Watchlist item = new Watchlist(Convert.ToInt32(data["id"]))
                        {
                            PortfolioId = Convert.ToInt32(data["portfolioid"]),
                            AssetName = data["assetname"].ToString(),
                            TargetPrice = Convert.ToDecimal(data["targetprice"])
                        };
                        watchlist.Add(item);
                    }
                }
                return watchlist;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Add new Watchlist item
        public bool InsertWatchlistItem(Watchlist item)
        {
            NpgsqlConnection dbConn = null;
            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = @"
                    INSERT INTO watchlist 
                    (portfolioid, assetname, targetprice) 
                    VALUES 
                    (@portfolioId, @assetName, @targetPrice)";

                cmd.Parameters.AddWithValue("@portfolioId", NpgsqlDbType.Integer, item.PortfolioId);
                cmd.Parameters.AddWithValue("@assetName", NpgsqlDbType.Text, item.AssetName);
                cmd.Parameters.AddWithValue("@targetPrice", NpgsqlDbType.Numeric, item.TargetPrice);

                bool result = InsertData(dbConn, cmd);
                return result;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        public bool DeleteWatchlistItem(int id)
        {
            NpgsqlConnection dbConn = null;
            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "DELETE FROM watchlist WHERE id = @id";
                cmd.Parameters.AddWithValue("@id", NpgsqlDbType.Integer, id);

                bool result = DeleteData(dbConn, cmd);
                return result;
            }
            finally
            {
                dbConn?.Close();
            }
        }
    }
}
