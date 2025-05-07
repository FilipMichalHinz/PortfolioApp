using System.Text;
using Microsoft.AspNetCore.Authorization;
using App.Model.Repositories;

namespace App.API.Middleware
{
    public class BasicAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;

        public BasicAuthenticationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Skip auth for [AllowAnonymous]
            if (context.GetEndpoint()?.Metadata.GetMetadata<IAllowAnonymous>() != null)
            {
                await _next(context);
                return;
            }

            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();

            if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Basic "))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Missing or invalid Authorization header.");
                return;
            }

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
                var userRepo = context.RequestServices.GetRequiredService<UserRepository>();
                var user = userRepo.GetByCredentials(username, password);

                if (user == null)
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync("Invalid credentials.");
                    return;
                }

                context.Items["UserId"] = user.Id;
                await _next(context);
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = 500;
                await context.Response.WriteAsync($"Authentication error: {ex.Message}");
            }
        }
    }

    public static class BasicAuthenticationMiddlewareExtensions
    {
        public static IApplicationBuilder UseBasicAuthenticationMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<BasicAuthenticationMiddleware>();
        }
    }
}
