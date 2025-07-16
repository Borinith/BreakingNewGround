using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BreakingNewGround.Server.DAL.AzureSQL.Data
{
    public class MedicinesContext : IdentityDbContext<ApplicationUser>
    {
        public MedicinesContext(DbContextOptions<MedicinesContext> options) : base(options)
        {
        }

        public DbSet<MedicineBodyType> MedicineBodyTypes { get; set; }

        public DbSet<MedicineType> MedicineTypes { get; set; }

        public DbSet<Medicine> Medicines { get; set; }
    }
}