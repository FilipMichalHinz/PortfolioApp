namespace App.Model.Entities
{
    public class Portfolio
    {
        public Portfolio() {}

        public Portfolio(int id)
        {
            Id = id;
        }

        public int Id { get; set; }

        public string Name { get; set; }

        public int UserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

    }
}
