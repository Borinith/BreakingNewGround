using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Linq;
using System.Threading.Tasks;
using AzureDb = BreakingNewGround.Server.DAL.AzureSQL.Data.AppDbContext;
using SqliteDb = BreakingNewGround.Server.DAL.SQLite.Data.AppDbContext;

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

            var sqliteMedicinesOptions = new DbContextOptionsBuilder<SqliteDb>()
                .UseSqlite(config.GetConnectionString("DefaultConnectionSQLiteMedicines"))
                .Options;

            var sqliteMemeDatabaseOptions = new DbContextOptionsBuilder<SqliteDb>()
                .UseSqlite(config.GetConnectionString("DefaultConnectionSQLiteMemeDatabase"))
                .Options;

            await using var azureSQLContext = new AzureDb(azureOptions);
            await using var sqliteMedicinesContext = new SqliteDb(sqliteMedicinesOptions);

            await CopyMedicines(azureSQLContext, sqliteMedicinesContext);
        }

        private static async Task CopyMedicines(AzureDb azureSQLContext, SqliteDb sqliteMedicinesContext)
        {
            var azureMedicineBodyTypes = await azureSQLContext.MedicineBodyTypes.AsNoTracking().ToArrayAsync();
            var azureMedicineTypes = await azureSQLContext.MedicineTypes.AsNoTracking().ToArrayAsync();
            var azureMedicines = await azureSQLContext.Medicines.AsNoTracking().ToArrayAsync();

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
    }
}