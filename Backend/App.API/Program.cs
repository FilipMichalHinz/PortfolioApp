using App.API.Middleware;
using App.Model.Repositories;

// Create a WebApplicationBuilder instance with command-line args
var builder = WebApplication.CreateBuilder(args);

// Register essential services to the dependency injection container
builder.Services.AddControllers(); // Enables controller support for API endpoints

// Swagger/OpenAPI configuration for API documentation
builder.Services.AddOpenApi(); // Custom extension method for OpenAPI setup (assumed)
builder.Services.AddEndpointsApiExplorer(); // Enables minimal API discovery for Swagger
builder.Services.AddSwaggerGen(); // Registers the Swagger generator

// Register custom repositories for dependency injection
builder.Services.AddScoped<PortfolioRepository, PortfolioRepository>();
builder.Services.AddScoped<PortfolioItemRepository, PortfolioItemRepository>();
builder.Services.AddScoped<WatchlistRepository, WatchlistRepository>();

// Build the application
var app = builder.Build();

// Configure middleware pipeline

// Enable Swagger and OpenAPI in development environment
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // Maps the OpenAPI endpoint (if AddOpenApi was a custom setup)
    app.UseSwagger(); // Enables Swagger middleware
    app.UseSwaggerUI(); // Enables Swagger UI interface
}

// Enable CORS globally (useful during frontend development/testing)
app.UseCors(policy => 
    policy.AllowAnyHeader()
          .AllowAnyMethod()
          .AllowAnyOrigin()
);

// Redirect HTTP to HTTPS if needed (currently commented out)
// app.UseHttpsRedirection();

// Custom middleware for basic authentication (defined in your API layer)
app.UseBasicAuthenticationMiddleware();

// Enables authorization handling (e.g., via [Authorize] attributes)
app.UseAuthorization();

// Maps controller endpoints (routes defined in controller classes)
app.MapControllers();

// Run the web application
app.Run();
