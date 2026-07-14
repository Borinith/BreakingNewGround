using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BreakingNewGround.Server.DAL.AzureSQL.Data
{
    [Table("Images")]
    [Index(nameof(Hash), IsUnique = true)]
    [Index(nameof(UploadedAtUtc))]
    public class Image
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [StringLength(255)]
        public required string OriginalFileName { get; set; }

        [Required]
        [StringLength(50)]
        public required string ContentType { get; set; }

        public bool IsFavorite { get; set; }

        public int Width { get; set; }

        public int Height { get; set; }

        public int SizeBytes { get; set; }

        [Required]
        [StringLength(50)]
        public required string ThumbnailContentType { get; set; }

        [Required]
        [MaxLength(32)]
        public required byte[] Hash { get; set; }

        public DateTime UploadedAtUtc { get; set; }

        public virtual ImageBytes Bytes { get; set; } = null!;

        public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
    }
}