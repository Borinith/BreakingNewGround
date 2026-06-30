using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BreakingNewGround.Server.DAL.BackupApp.Data_SQLite_Images
{
    [Table("tags")]
    [Index(nameof(Name), IsUnique = true)]
    public class Tag
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("name")]
        public required string Name { get; set; }

        public virtual ICollection<Image> Images { get; set; } = new List<Image>();
    }
}