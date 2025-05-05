using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace App.API.Middleware;

public class BasicAuthenticationMiddleware {
    private const string USERNAME = "Champion";
    private const string PASSWORD = "Password";

    private readonly RequestDelegate _next;

    public BasicAuthenticationMiddleware(RequestDelegate next) {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context) {
        // Bypass authentication for [AllowAnonymous]
        if (context.GetEndpoint()?.Metadata.GetMetadata<IAllowAnonymous>() != null) {
            await _next(context);
            return;
        }

        // 1. Try to retrieve the Authorization header
        string? authHeader = context.Request.Headers["Authorization"];

        // 2. If not found, then return with Unauthorized response
        if (authHeader == null) {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Authorization Header value not provided");
            return;
        }

        // 3. Expect format 'Basic am9obi5kb2U6VmVyeVNlY3JldCE='
        var parts = authHeader.Split(' ');
        if (parts.Length != 2 || parts[0] != "Basic") {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Invalid Authorization format");
            return;
        }

        // 4. Decode Base64 to username:password
        var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(parts[1]));

        // 5. Split into username and password
        var split = decoded.Split(':');
        if (split.Length != 2) {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Invalid Authorization content");
            return;
        }

        var username = split[0];
        var password = split[1];

        // 6. Validate credentials
        if (username == USERNAME && password == PASSWORD) {
            await _next(context);
        } else {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Incorrect credentials provided");
            return;
        }
    }
}

public static class BasicAuthenticationMiddlewareExtensions {
    public static IApplicationBuilder UseBasicAuthenticationMiddleware(this IApplicationBuilder builder) {
        return builder.UseMiddleware<BasicAuthenticationMiddleware>();
    }
}
