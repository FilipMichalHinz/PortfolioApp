using App.Model.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
// Add Swagger generation (OpenAPI)
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register repositories
builder.Services.AddScoped<PortfolioRepository, PortfolioRepository>();
builder.Services.AddScoped<PortfolioItemRepository, PortfolioItemRepository>();
builder.Services.AddScoped<WatchlistRepository, WatchlistRepository>();



var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Optional: Enable CORS for testing from frontend
app.UseCors(policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
