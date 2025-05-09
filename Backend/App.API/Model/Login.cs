namespace App.API;

using System;
using System.Text.Json.Serialization;

// Represents a login request payload, typically received from the client (e.g., frontend)
public class Login
{
    // Maps the incoming JSON property "username" to this property
    [JsonPropertyName("username")]
    public string Username { get; set; }

    // Maps the incoming JSON property "password" to this property
    [JsonPropertyName("password")]
    public string Password { get; set; }
}

// src/app/model/login.ts
export interface Login {
  userId: number;       // Matches what your C# backend sends
  username: string;     // Matches what your C# backend sends
  authHeader: string;   // Matches what your C# backend sends
}
