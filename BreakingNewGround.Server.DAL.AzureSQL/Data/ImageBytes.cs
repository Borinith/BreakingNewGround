using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BreakingNewGround.Server.DAL.AzureSQL.Data
{
    [Table("Images")]
    public class ImageBytes
    {
        [Key]
        [ForeignKey(nameof(Image))]
        public Guid Id { get; set; }

        [Required]
        public required byte[] Original { get; set; }

        [Required]
        public required byte[] Thumbnail { get; set; }

        public virtual Image Image { get; set; } = null!;
    }
}