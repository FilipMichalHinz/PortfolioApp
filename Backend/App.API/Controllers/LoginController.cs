using App.Model.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace App.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly UserRepository _userRepo;

        public LoginController(UserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        [AllowAnonymous]
        [HttpPost]
        public ActionResult Login([FromBody] Login credentials)
        {
            var user = _userRepo.GetByCredentials(credentials.Username, credentials.Password);

            if (user == null)
                return Unauthorized("Invalid username or password");

            // Generiere Basic Auth Header zur Verwendung im Frontend
            var raw = $"{credentials.Username}:{credentials.Password}";
            var encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(raw));
            var headerValue = $"Basic {encoded}";

            return Ok(new
            {
                userId = user.Id,
                username = user.Username,
                authHeader = headerValue
            });
        }
    }
}
