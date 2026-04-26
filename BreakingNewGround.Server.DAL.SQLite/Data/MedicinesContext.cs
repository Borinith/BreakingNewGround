using BreakingNewGround.Server.DAL.SQLite.Views;
using Microsoft.EntityFrameworkCore;

namespace BreakingNewGround.Server.DAL.SQLite.Data
{
    public class MedicinesContext : DbContext
    {
        public MedicinesContext(DbContextOptions<MedicinesContext> options) : base(options)
        {
        }

        public DbSet<MedicineBodyType> MedicineBodyTypes { get; set; }

        public DbSet<MedicineType> MedicineTypes { get; set; }

        public DbSet<Medicine> Medicines { get; set; }

        public DbSet<ExpirationDateIsClose> ExpirationDateIsClose { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<ExpirationDateIsClose>().ToView("expiration_date_is_close");
        }
    }
}