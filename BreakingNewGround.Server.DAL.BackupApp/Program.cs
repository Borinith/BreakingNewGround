using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Linq;
using System.Threading.Tasks;
using AzureDb = BreakingNewGround.Server.DAL.AzureSQL.Data.AppDbContext;
using SqliteDbImages = BreakingNewGround.Server.DAL.BackupApp.Data_SQLite_Images.AppDbContext;
using SqliteDbMedicines = BreakingNewGround.Server.DAL.SQLite.Data.AppDbContext;

namespace BreakingNewGround.Server.DAL.BackupApp
{
    internal class Program
    {
        private static async Task Main()
        {
            var config = new ConfigurationBuilder()
                .AddUserSecrets<Program>(optional: true)
                .Build();

            var azureOptions = new DbContextOptionsBuilder<AzureDb>()
                .UseAzureSql(config.GetConnectionString("DefaultConnectionAzureSQL"))
                .Options;

            var sqliteMedicinesOptions = new DbContextOptionsBuilder<SqliteDbMedicines>()
                .UseSqlite(config.GetConnectionString("DefaultConnectionSQLiteMedicines"))
                .Options;

            var sqliteImagesDatabaseOptions = new DbContextOptionsBuilder<SqliteDbImages>()
                .UseSqlite(config.GetConnectionString("DefaultConnectionSQLiteImagesDatabase"))
                .Options;

            await using var azureSQLContext = new AzureDb(azureOptions);
            await using var sqliteMedicinesContext = new SqliteDbMedicines(sqliteMedicinesOptions);
            await using var sqliteImagesContext = new SqliteDbImages(sqliteImagesDatabaseOptions);

            await CopyMedicines(azureSQLContext, sqliteMedicinesContext);
            await CopyImages(azureSQLContext, sqliteImagesContext);
        }

        private static async Task CopyMedicines(AzureDb azureSQLContext, SqliteDbMedicines sqliteMedicinesContext)
        {
            var azureMedicineBodyTypes = await azureSQLContext.MedicineBodyTypes.AsNoTracking().OrderBy(x => x.Id).ToArrayAsync();
            var azureMedicineTypes = await azureSQLContext.MedicineTypes.AsNoTracking().OrderBy(x => x.Id).ToArrayAsync();
            var azureMedicines = await azureSQLContext.Medicines.AsNoTracking().OrderBy(x => x.Id).ToArrayAsync();

            await using var transaction = await sqliteMedicinesContext.Database.BeginTransactionAsync();

            await sqliteMedicinesContext.Medicines.ExecuteDeleteAsync();
            await sqliteMedicinesContext.MedicineBodyTypes.ExecuteDeleteAsync();
            await sqliteMedicinesContext.MedicineTypes.ExecuteDeleteAsync();

            await sqliteMedicinesContext.MedicineBodyTypes
                .AddRangeAsync(azureMedicineBodyTypes.Select(x => new SQLite.Data.MedicineBodyType
                {
                    Id = x.Id,
                    Name = x.Name
                }));

            await sqliteMedicinesContext.MedicineTypes
                .AddRangeAsync(azureMedicineTypes.Select(x => new SQLite.Data.MedicineType
                {
                    Id = x.Id,
                    Name = x.Name
                }));

            await sqliteMedicinesContext.Medicines
                .AddRangeAsync(azureMedicines.Select(x => new SQLite.Data.Medicine
                {
                    Id = x.Id,
                    Name = x.Name,
                    ExpirationDate = x.ExpirationDate,
                    BodyTypeId = x.BodyTypeId,
                    TypeId = x.TypeId,
                    Count = x.Count,
                    Comment = x.Comment
                }));

            await sqliteMedicinesContext.SaveChangesAsync();
            await transaction.CommitAsync();
        }

        private static async Task CopyImages(AzureDb azureSQLContext, SqliteDbImages sqliteImagesContext)
        {
            var azureTags = await azureSQLContext.Tags
                .AsNoTracking()
                .OrderBy(x => x.Id)
                .ToArrayAsync();

            var azureImages = await azureSQLContext.Images
                .Include(x => x.Bytes)
                .Include(x => x.Tags)
                .AsNoTracking()
                .OrderBy(x => x.Id)
                .ToArrayAsync();

            await using var transaction = await sqliteImagesContext.Database.BeginTransactionAsync();

            await sqliteImagesContext.Tags.ExecuteDeleteAsync();
            await sqliteImagesContext.Images.ExecuteDeleteAsync();

            var sqliteTagsById = azureTags.ToDictionary(
                x => x.Id,
                x => new Data_SQLite_Images.Tag
                {
                    Id = x.Id,
                    Name = x.Name
                });

            await sqliteImagesContext.Tags.AddRangeAsync(sqliteTagsById.Values);

            var sqliteImages = azureImages.Select(x =>
            {
                var image = new Data_SQLite_Images.Image
                {
                    Id = x.Id,
                    OriginalFileName = x.OriginalFileName,
                    ContentType = x.ContentType,
                    IsFavorite = x.IsFavorite,
                    Width = x.Width,
                    Height = x.Height,
                    SizeBytes = x.SizeBytes,
                    Original = x.Bytes.Original,
                    Thumbnail = x.Bytes.Thumbnail,
                    ThumbnailContentType = x.ThumbnailContentType,
                    Hash = x.Hash,
                    UploadedAtUtc = x.UploadedAtUtc
                };

                foreach (var azureTagId in x.Tags.Select(y => y.Id))
                {
                    image.Tags.Add(sqliteTagsById[azureTagId]);
                }

                return image;
            }).ToArray();

            await sqliteImagesContext.Images.AddRangeAsync(sqliteImages);

            await sqliteImagesContext.SaveChangesAsync();
            await transaction.CommitAsync();
        }
    }
}