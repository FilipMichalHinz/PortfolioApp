using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace App.API.Middleware
{
    // Middleware for handling basic HTTP authentication
    public class BasicAuthenticationMiddleware
    {
        // Hardcoded credentials (for demonstration or testing purposes only)
        private const string USERNAME = "Champion";
        private const string PASSWORD = "Password";

        private readonly RequestDelegate _next;

        // Constructor accepts the next middleware in the pipeline
        public BasicAuthenticationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        // This method is executed for every HTTP request
        public async Task InvokeAsync(HttpContext context)
        {
            // Skip authentication if the endpoint explicitly allows anonymous access
            if (context.GetEndpoint()?.Metadata.GetMetadata<IAllowAnonymous>() != null)
            {
                await _next(context);
                return;
            }

            // Step 1: Attempt to retrieve the Authorization header
            string? authHeader = context.Request.Headers["Authorization"];

            // Step 2: If the header is missing, return a 401 Unauthorized response
            if (authHeader == null)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Authorization Header value not provided");
                return;
            }

            // Step 3: Validate the format of the Authorization header (expecting 'Basic <Base64>')
            var parts = authHeader.Split(' ');
            if (parts.Length != 2 || parts[0] != "Basic")
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Invalid Authorization format");
                return;
            }

            // Step 4: Decode the Base64 encoded credentials (format: username:password)
            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(parts[1]));

            // Step 5: Split the decoded string into username and password
            var split = decoded.Split(':');
            if (split.Length != 2)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Invalid Authorization content");
                return;
            }

            var username = split[0];
            var password = split[1];

            // Step 6: Validate the provided credentials against the hardcoded ones
            if (username == USERNAME && password == PASSWORD)
            {
                // Credentials are valid, proceed to the next middleware
                await _next(context);
            }
            else
            {
                // Credentials are invalid, deny access
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Incorrect credentials provided");
                return;
            }
        }
    }

    // Extension method to make it easy to register the middleware in Program.cs
    public static class BasicAuthenticationMiddlewareExtensions
    {
        public static IApplicationBuilder UseBasicAuthenticationMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<BasicAuthenticationMiddleware>();
        }
    }
}
