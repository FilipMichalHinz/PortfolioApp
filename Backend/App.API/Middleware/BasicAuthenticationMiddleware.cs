// =============================
// File: BasicAuthenticationMiddleware.cs
// Description:
// Implements custom Basic Authentication middleware for the API. It inspects incoming HTTP requests,
// checks for the presence and validity of an Authorization header, validates credentials via the UserRepository,
// and injects user context into the pipeline. Also includes an extension method for middleware registration.
// =============================

using System.Text;
using Microsoft.AspNetCore.Authorization;
using App.Model.Repositories;

namespace App.API.Middleware
{
    public class BasicAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;

        // Constructor injects the next middleware in the pipeline
        public BasicAuthenticationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        // Core logic of the middleware
        public async Task InvokeAsync(HttpContext context)
        {
            // Skip authentication if the endpoint allows anonymous access (e.g. [AllowAnonymous])
            if (context.GetEndpoint()?.Metadata.GetMetadata<IAllowAnonymous>() != null)
            {
                await _next(context);
                return;
            }

            // Try to read the Authorization header
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();

            // Reject if header is missing or not using Basic scheme
            if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Basic "))
            {
                context.Response.StatusCode = 401; // Unauthorized
                await context.Response.WriteAsync("Missing or invalid Authorization header.");
                return;
            }

            // Strip "Basic " prefix and decode Base64 credentials
            var encoded = authHeader.Substring("Basic ".Length).Trim();

            string decoded;
            try
            {
                decoded = Encoding.UTF8.GetString(Convert.FromBase64String(encoded));
            }
            catch (FormatException)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Authorization header is not valid Base64.");
                return;
            }

            // Expected format: "username:password"
            var parts = decoded.Split(':', 2);
            if (parts.Length != 2)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Authorization header must contain username and password.");
                return;
            }

            var username = parts[0];
            var password = parts[1];

            try
            {
                // Resolve UserRepository from DI container
                var userRepo = context.RequestServices.GetRequiredService<UserRepository>();

                // Validate credentials
                var user = userRepo.GetByCredentials(username, password);

                if (user == null)
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync("Invalid credentials.");
                    return;
                }

                // Inject user context into the pipeline (optional: can be accessed in controllers)
                context.Items["UserId"] = user.Id;

                // Continue to the next middleware/component
                await _next(context);
            }
            catch (Exception ex)
            {
                // Internal error during authentication process
                context.Response.StatusCode = 500;
                await context.Response.WriteAsync($"Authentication error: {ex.Message}");
            }
        }
    }

    // Extension method to simplify middleware registration in Program.cs
    public static class BasicAuthenticationMiddlewareExtensions
    {
        public static IApplicationBuilder UseBasicAuthenticationMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<BasicAuthenticationMiddleware>();
        }
    }
}
