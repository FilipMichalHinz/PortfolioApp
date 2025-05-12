// =============================
// File: Login.cs
// Description:
// This file defines the `Login` data model used for handling login requests from the client.
// It maps incoming JSON data (typically username and password) to a C# object
// that can be validated and processed by the authentication logic in the backend.
// =============================

namespace App.API;

using System.Text.Json.Serialization;

// Represents a login request payload, typically received from the client (e.g. frontend)
public class Login
{
    // Maps the incoming JSON property "username" to this property.
    // Enables correct deserialization from JSON to this object.
    [JsonPropertyName("username")]
    public string Username { get; set; }

    // Maps the incoming JSON property "password" to this property.
    // This property holds the raw password string from the client.
    [JsonPropertyName("password")]
    public string Password { get; set; }
}
