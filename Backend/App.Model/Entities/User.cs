// =============================
// File: User.cs
// Description:
// Represents a system user account used for authentication and ownership of data entities (e.g. portfolios, watchlists).
// Stores login credentials in a secure form and serves as the primary identity model throughout the backend.
// =============================

namespace App.Model.Entities
{
    public class User
    {
        // Unique identifier of the user (primary key)
        public int Id { get; set; }

        // The username chosen by the user for login and identification
        public string Username { get; set; }

        // A securely hashed version of the user's password (not stored in plain text)
        public string PasswordHash { get; set; }
    }
}
