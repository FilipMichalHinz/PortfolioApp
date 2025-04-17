namespace App.Model.Entities
{
    public class Transaction
    {
        public Transaction() { }

        public Transaction(int id)
        {
            Id = id;
        }

        public int Id { get; set; }

        public int PortfolioItemId { get; set; }

        public string TransactionType { get; set; } // "Buy" or "Sell"

        public decimal Price { get; set; }

        public decimal Quantity { get; set; }

        public DateTime Date { get; set; }
    }
}
