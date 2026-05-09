using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BreakingNewGround.Server.DAL.AzureSQL.Data
{
    [Index(nameof(Name), IsUnique = true)]
    public class Tag
    {
        [Key]
        public long Id { get; set; }

        [Required]
        [StringLength(100)]
        public required string Name { get; set; }

        public virtual ICollection<Image> Images { get; set; } = new List<Image>();
    }
}