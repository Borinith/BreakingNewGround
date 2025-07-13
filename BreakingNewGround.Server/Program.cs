using BreakingNewGround.Server;
using BreakingNewGround.Server.DAL.AzureSQL.Data;
using BreakingNewGround.Server.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

/*builder.Services.AddDbContext<MedicinesContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnectionSQLite")));*/

builder.Services.AddDbContext<MedicinesContext>(options =>
    options.UseAzureSql(builder.Configuration.GetConnectionString("DefaultConnectionAzureSQL")));

builder.Services.AddScoped(typeof(IGenericCrudService<>), typeof(GenericCrudService<>));

using var app = builder.Build();

#pragma warning disable DF0001
app.MapDefaultEndpoints();
#pragma warning restore DF0001

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.UseRouting();
app.MapDefaultControllerRoute();

app.MapFallbackToFile("/index.html");

app.Run();