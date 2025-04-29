namespace App.API;

using System;
using System.Text.Json.Serialization;

public class Login {
[JsonPropertyName("username")]
public string Username { get; set; }
[JsonPropertyName("password")]
public string Password { get; set; }
}
