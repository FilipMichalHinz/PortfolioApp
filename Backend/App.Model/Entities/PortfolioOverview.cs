// We use different class, as most of these properties are not found in the database
namespace App.Model.Entities
{
    public class PortfolioOverview
    {
        public int Id { get; set; }                
        public string PortfolioName { get; set; }  
        public decimal InitialInvestment { get; set; }   
        public decimal CurrentValue { get; set; }        
        public decimal TotalProfitLoss { get; set; }     
        public decimal ChangePercent { get; set; }       
        public int AssetCount { get; set; }     // Number of assets in the portfolio       
    }
}
