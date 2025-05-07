namespace App.Model.Entities
{
    public class Watchlist
    {
        public Watchlist() {}

        public Watchlist(int id)
        {
            Id = id;
        }

        public int Id { get; set; }

        public int UserId { get; set; }

        public string AssetName { get; set; }

        public decimal TargetPrice { get; set; }
    }
}
