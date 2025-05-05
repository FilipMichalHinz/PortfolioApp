using Microsoft.Extensions.Configuration;
using Npgsql;

namespace App.Model.Repositories
{
    // Base class for repository classes that interact with a PostgreSQL database
    public class BaseRepository
    {
        // Connection string used to connect to the PostgreSQL database
        protected string ConnectionString { get; }

        // Constructor that receives the application's configuration object
        // and retrieves the connection string named "AppDb"
        public BaseRepository(IConfiguration configuration)
        {
            ConnectionString = configuration.GetConnectionString("AppDb");
        }

        // Executes a query command and returns a data reader for reading results
        // Note: The caller is responsible for disposing the connection and reader
        protected NpgsqlDataReader GetData(NpgsqlConnection conn, NpgsqlCommand cmd)
        {
            conn.Open();
            return cmd.ExecuteReader();
        }

        // Executes a non-query command for inserting data
        // Returns true if execution completes without exception
        protected bool InsertData(NpgsqlConnection conn, NpgsqlCommand cmd)
        {
            conn.Open();
            cmd.ExecuteNonQuery();
            return true;
        }

        // Executes a non-query command for updating data
        // Returns true if execution completes without exception
        protected bool UpdateData(NpgsqlConnection conn, NpgsqlCommand cmd)
        {
            conn.Open();
            cmd.ExecuteNonQuery();
            return true;
        }

        // Executes a non-query command for deleting data
        // Returns true if execution completes without exception
        protected bool DeleteData(NpgsqlConnection conn, NpgsqlCommand cmd)
        {
            conn.Open();
            cmd.ExecuteNonQuery();
            return true;
        }
    }
}
