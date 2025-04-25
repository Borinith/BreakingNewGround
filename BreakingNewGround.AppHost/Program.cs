using Aspire.Hosting;
using Projects;

var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<BreakingNewGround_Server>("breakingnewground-server");

builder.Build().Run();