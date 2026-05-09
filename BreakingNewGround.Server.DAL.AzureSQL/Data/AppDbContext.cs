using BreakingNewGround.Server.DAL.AzureSQL.Views;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BreakingNewGround.Server.DAL.AzureSQL.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<MedicineBodyType> MedicineBodyTypes { get; set; }

        public DbSet<MedicineType> MedicineTypes { get; set; }

        public DbSet<Medicine> Medicines { get; set; }

        public DbSet<ExpirationDateIsClose> ExpirationDateIsClose { get; set; }

        public DbSet<Image> Images { get; set; }

        public DbSet<Tag> Tags { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<ExpirationDateIsClose>().ToView("ExpirationDateIsClose");
        }
    }
}