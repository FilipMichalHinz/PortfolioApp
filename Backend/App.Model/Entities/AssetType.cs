namespace App.Model.Entities
{
    public class AssetType
    {
        public AssetType() {}

        public AssetType(int id)
        {
            Id = id;
        }

        public int Id { get; set; }

        public string Name { get; set; } // Example: "Stock", "Crypto"
    }
}
