using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BreakingNewGround.Server.DAL.BackupApp.Data_SQLite_Images
{
    [Table("images")]
    [Index(nameof(Hash), IsUnique = true)]
    public class Image
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("original_file_name")]
        public required string OriginalFileName { get; set; }

        [Required]
        [Column("content_type")]
        public required string ContentType { get; set; }

        [Column("is_favorite")]
        public bool IsFavorite { get; set; }

        [Column("width")]
        public int Width { get; set; }

        [Column("height")]
        public int Height { get; set; }

        [Column("size_bytes")]
        public int SizeBytes { get; set; }

        [Required]
        [Column("original")]
        public required byte[] Original { get; set; }

        [Required]
        [Column("thumbnail")]
        public required byte[] Thumbnail { get; set; }

        [Required]
        [Column("thumbnail_content_type")]
        public required string ThumbnailContentType { get; set; }

        [Required]
        [Column("hash")]
        public required byte[] Hash { get; set; }

        [Column("uploaded_at_utc")]
        public DateTime UploadedAtUtc { get; set; }

        public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
    }
}