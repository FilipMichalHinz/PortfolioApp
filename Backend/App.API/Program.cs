// =============================
// File: Program.cs
// Description:
// This is the entry point of the Portfolio API backend. It sets up the web application,
// configures services like controllers, Swagger, repositories, and middleware (e.g. authentication).
// It integrates the application's core layers (API, middleware, repositories) and launches the web server.
// =============================

using App.API.Middleware;
using App.Model.Entities;
using App.Model.Repositories;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Register MVC controllers (API endpoints)
builder.Services.AddControllers();

// Enable Swagger/ OpenAPI documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Portfolio API", 
        Version = "v1" 
    });

    // Configure Swagger to use Basic Authentication
    c.AddSecurityDefinition("basic", new OpenApiSecurityScheme
    {
        Name = "Authorization",                    // HTTP header name
        Type = SecuritySchemeType.Http,            // Type: HTTP-based auth
        Scheme = "basic",                          // Use HTTP Basic scheme
        In = ParameterLocation.Header,             // Location of the header
        Description = "Basic Authentication header"
    });

    // Apply the Basic Auth security requirement globally
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "basic"
                }
            },
            Array.Empty<string>() // No specific scopes required
        }
    });
});

// Register custom repositories for dependency injection
builder.Services.AddScoped<PortfolioRepository>();
builder.Services.AddScoped<AssetRepository>();
builder.Services.AddScoped<WatchlistRepository>();
builder.Services.AddScoped<UserRepository>();

var app = builder.Build();

// Enable Swagger only in development environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();            // Enable Swagger middleware
    app.UseSwaggerUI();         // Enable Swagger UI
}

// Enable Cross-Origin Resource Sharing (CORS) with permissive settings
app.UseCors(policy =>
    policy.AllowAnyHeader()
          .AllowAnyMethod()
          .AllowAnyOrigin()
);

// Register custom middleware for Basic Authentication
app.UseBasicAuthenticationMiddleware();

// Enable authorization middleware (enforces [Authorize] attributes)
app.UseAuthorization();

// Map controller routes to endpoints
app.MapControllers();

// Start the application
app.Run();

// Partial Program class is required for integration testing
public partial class Program { }
