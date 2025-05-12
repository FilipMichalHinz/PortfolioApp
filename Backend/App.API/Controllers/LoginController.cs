// =============================
// File: LoginController.cs
// Description:
// Provides an HTTP POST endpoint for user login, which validates credentials via UserRepository.
// If authentication succeeds, it returns the user's ID, username, and a Basic Auth header value
// that can be used by the frontend for authenticated requests.
// =============================

using App.Model.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace App.API.Controllers
{
    [Route("api/[controller]")] // Route: /api/login
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly UserRepository _userRepo;

        // Inject UserRepository via dependency injection
        public LoginController(UserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        // Allows unauthenticated access to this login endpoint
        [AllowAnonymous]
        [HttpPost]
        public ActionResult Login([FromBody] Login credentials)
        {
            // Look up the user using the provided credentials
            var user = _userRepo.GetByCredentials(credentials.Username, credentials.Password);

            if (user == null)
                return Unauthorized("Invalid username or password");

            // Generate a Basic Authentication header value
            // Format: "Basic base64(username:password)"
            var raw = $"{credentials.Username}:{credentials.Password}";
            var encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(raw));
            var headerValue = $"Basic {encoded}";

            // Return essential login information to the client
            return Ok(new
            {
                userId = user.Id,
                username = user.Username,
                authHeader = headerValue
            });
        }
    }
}
