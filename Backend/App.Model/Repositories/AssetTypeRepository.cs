using App.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    public class AssetTypeRepository : BaseRepository
    {
        public AssetTypeRepository(IConfiguration configuration) : base(configuration) { }

        public List<AssetType> GetAllAssetTypes()
        {
            NpgsqlConnection dbConn = null;
            var types = new List<AssetType>();

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "SELECT * FROM assettypes";

                var data = GetData(dbConn, cmd);
                if (data != null)
                {
                    while (data.Read())
                    {
                        AssetType type = new AssetType(Convert.ToInt32(data["id"]))
                        {
                            Name = data["name"].ToString()
                        };
                        types.Add(type);
                    }
                }
                return types;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Add new AssetType
        public bool InsertAssetType(AssetType type)
        {
            NpgsqlConnection dbConn = null;
            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = @"
                    INSERT INTO assettypes 
                    (name)
                    VALUES 
                    (@name)";

                cmd.Parameters.AddWithValue("@name", NpgsqlDbType.Text, type.Name);

                bool result = InsertData(dbConn, cmd);
                return result;
            }
            finally
            {
                dbConn?.Close();
            }
        }
    }
}
