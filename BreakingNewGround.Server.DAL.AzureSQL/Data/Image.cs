using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BreakingNewGround.Server.DAL.AzureSQL.Data
{
    [Index(nameof(Hash), IsUnique = true)]
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
        public required byte[] Original { get; set; }

        [Required]
        public required byte[] Thumbnail { get; set; }

        [Required]
        [StringLength(50)]
        public required string ThumbnailContentType { get; set; }

        [Required]
        [MaxLength(32)]
        public required byte[] Hash { get; set; }

        public DateTime UploadedAt { get; set; }

        public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
    }
}