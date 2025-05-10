namespace App.Tests.Models
{
    /* Summary
    Represents the expected structure of the JSON response from the login endpoint.
    */
    public class LoginResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string AuthHeader { get; set; }
    }
}
