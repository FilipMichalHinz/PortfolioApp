// =============================
// File: LoginResponse.cs
// Description:
// Represents the expected structure of the JSON response returned by the /api/login endpoint.
// Used in integration tests to deserialize and verify successful login responses.
// =============================

namespace App.Tests.Models
{
    public class LoginResponse
    {
        // Unique identifier of the authenticated user
        public int UserId { get; set; }

        // Username of the authenticated user (should match submitted credentials)
        public string Username { get; set; }

        // Authorization header value (e.g. "Basic base64(username:password)")
        public string AuthHeader { get; set; }
    }
}
