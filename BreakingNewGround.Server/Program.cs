using BreakingNewGround.Server.DAL.AzureSQL.Data;
using BreakingNewGround.Server.Models;
using BreakingNewGround.Server.Models.Weather;
using BreakingNewGround.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes =
    [
        "text/html",
        "text/css",
        "text/javascript",
        "application/javascript"
    ];
});

/*builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnectionSQLite")));*/

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseAzureSql(builder.Configuration.GetConnectionString("DefaultConnectionAzureSQL"), o => o.EnableRetryOnFailure(3)));

builder.Services.AddScoped<IPasswordHasher<ApplicationUser>, Argon2idPasswordHasherService>();

builder.Services.AddHttpClient<IWeatherForecastService, WeatherForecastService>();

builder.Services.AddScoped(typeof(IGenericCrudService<>), typeof(GenericCrudService<>));

builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddSingleton<IImageProcessor, ImageProcessor>();

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(x =>
    {
        x.Password.RequireDigit = false;
        x.Password.RequireLowercase = true;
        x.Password.RequireUppercase = false;
        x.Password.RequireNonAlphanumeric = false;
        x.Password.RequiredLength = 3;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.Configure<WeatherSettings>(builder.Configuration.GetSection("Weather"));

var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.Configure<JwtSettings>(jwtSection);

var jwt = jwtSection.Get<JwtSettings>();
var key = Encoding.UTF8.GetBytes(jwt!.Key);

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = true;
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddHybridCache();

using var app = builder.Build();

#pragma warning disable DF0001
app.MapDefaultEndpoints();
#pragma warning restore DF0001

app.UseResponseCompression();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseRouting();
app.MapDefaultControllerRoute();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapFallbackToFile("/index.html");

app.Run();