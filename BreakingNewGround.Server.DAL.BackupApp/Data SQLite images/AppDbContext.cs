using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace BreakingNewGround.Server.DAL.BackupApp.Data_SQLite_Images
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Image> Images { get; set; }

        public DbSet<Tag> Tags { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            /*modelBuilder.Entity<Image>()
                .Property(i => i.Id)
                .HasDefaultValueSql("NEWSEQUENTIALID()");*/

            modelBuilder.Entity<Image>()
                .HasMany(x => x.Tags)
                .WithMany(x => x.Images)
                .UsingEntity<Dictionary<string, object>>(
                    "image_tag",
                    x => x.HasOne<Tag>().WithMany().HasForeignKey("tags_id"),
                    x => x.HasOne<Image>().WithMany().HasForeignKey("images_id"));
        }
    }
}