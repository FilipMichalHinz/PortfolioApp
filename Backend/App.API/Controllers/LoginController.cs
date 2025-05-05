using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.API.Controllers
{
    // Route: api/login
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        // Static credentials for demonstration (should be stored securely in real applications)
        private const string USERNAME = "Champion";
        private const string PASSWORD = "Password";

        // Allows unauthenticated users to call this endpoint
        [AllowAnonymous]
        [HttpPost]
        public ActionResult Login([FromBody] Login credentials)
        {
            // Validate submitted credentials against hardcoded values
            if (credentials.Username == USERNAME && credentials.Password == PASSWORD)
            {
                // 1. Format the credentials as "username:password"
                var text = $"{credentials.Username}:{credentials.Password}";

                // 2. Convert the string to Base64
                var bytes = System.Text.Encoding.Default.GetBytes(text);
                var encodedCredentials = Convert.ToBase64String(bytes);

                // 3. Add "Basic" prefix for use in Authorization header
                var headerValue = $"Basic {encodedCredentials}";

                // Return the Authorization header string to the client
                return Ok(new { headerValue = headerValue });
            }
            else
            {
                // Return 401 Unauthorized if credentials are incorrect
                return Unauthorized();
            }
        }
    }
}
