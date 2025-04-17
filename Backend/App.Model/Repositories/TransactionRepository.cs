using App.Model.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using NpgsqlTypes;

namespace App.Model.Repositories
{
    public class TransactionRepository : BaseRepository
    {
        public TransactionRepository(IConfiguration configuration) : base(configuration) { }

        public List<Transaction> GetTransactionsByPortfolioItem(int portfolioItemId)
        {
            NpgsqlConnection dbConn = null;
            var transactions = new List<Transaction>();

            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = "SELECT * FROM transactions WHERE portfolioitemid = @portfolioItemId";
                cmd.Parameters.AddWithValue("@portfolioItemId", NpgsqlDbType.Integer, portfolioItemId);

                var data = GetData(dbConn, cmd);
                if (data != null)
                {
                    while (data.Read())
                    {
                        Transaction transaction = new Transaction(Convert.ToInt32(data["id"]))
                        {
                            PortfolioItemId = Convert.ToInt32(data["portfolioitemid"]),
                            TransactionType = data["transactiontype"].ToString(),
                            Price = Convert.ToDecimal(data["price"]),
                            Quantity = Convert.ToDecimal(data["quantity"]),
                            Date = Convert.ToDateTime(data["date"])
                        };
                        transactions.Add(transaction);
                    }
                }
                return transactions;
            }
            finally
            {
                dbConn?.Close();
            }
        }

        // Add new Transaction
        public bool InsertTransaction(Transaction transaction)
        {
            NpgsqlConnection dbConn = null;
            try
            {
                dbConn = new NpgsqlConnection(ConnectionString);
                var cmd = dbConn.CreateCommand();
                cmd.CommandText = @"
                    INSERT INTO transactions 
                    (portfolioitemid, transactiontype, price, quantity, date)
                    VALUES 
                    (@portfolioItemId, @type, @price, @quantity, @date)";

                cmd.Parameters.AddWithValue("@portfolioItemId", NpgsqlDbType.Integer, transaction.PortfolioItemId);
                cmd.Parameters.AddWithValue("@type", NpgsqlDbType.Text, transaction.TransactionType);
                cmd.Parameters.AddWithValue("@price", NpgsqlDbType.Numeric, transaction.Price);
                cmd.Parameters.AddWithValue("@quantity", NpgsqlDbType.Numeric, transaction.Quantity);
                cmd.Parameters.AddWithValue("@date", NpgsqlDbType.Date, transaction.Date);

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
