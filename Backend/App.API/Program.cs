using App.API.Middleware;
using App.Model.Entities;
using App.Model.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi.Models;

/*
var hasher = new PasswordHasher<User>();
var hash2 = hasher.HashPassword(new User(), "Tofire24");
Console.WriteLine(hash2);
return;
*/

var builder = WebApplication.CreateBuilder(args);

// Register essential services
builder.Services.AddControllers();

// Swagger configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Portfolio API", Version = "v1" });

    // 🔐 Basic Auth configuration for Swagger UI
    c.AddSecurityDefinition("basic", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "basic",
        In = ParameterLocation.Header,
        Description = "Basic Authentication header"
    });

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
            Array.Empty<string>()
        }
    });
});

// Register repositories
builder.Services.AddScoped<PortfolioRepository>();
builder.Services.AddScoped<AssetRepository>();
builder.Services.AddScoped<WatchlistRepository>();
builder.Services.AddScoped<UserRepository>();

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(policy =>
    policy.AllowAnyHeader()
          .AllowAnyMethod()
          .AllowAnyOrigin()
);

app.UseBasicAuthenticationMiddleware();

app.UseAuthorization();

app.MapControllers();


app.Run();

public partial class Program { }

/*
var hash2 = hasher.HashPassword(new User(), "password");
var hash3 = hasher.HashPassword(new User(), "password");

Console.WriteLine(hash1);
Console.WriteLine(hash2);
Console.WriteLine(hash3);
*/
