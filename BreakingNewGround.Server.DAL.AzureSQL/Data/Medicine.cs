using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BreakingNewGround.Server.DAL.AzureSQL.Data
{
    [Index(nameof(BodyTypeId))]
    [Index(nameof(TypeId))]
    public class Medicine
    {
        [Key]
        public long Id { get; set; }

        [Required]
        [StringLength(100)]
        public required string Name { get; set; }

        public DateOnly? ExpirationDate { get; set; }

        [ForeignKey(nameof(BodyType))]
        public long? BodyTypeId { get; set; }

        [DeleteBehavior(DeleteBehavior.SetNull)]
        public virtual MedicineBodyType? BodyType { get; set; }

        [ForeignKey(nameof(Type))]
        public long? TypeId { get; set; }

        [DeleteBehavior(DeleteBehavior.SetNull)]
        public virtual MedicineType? Type { get; set; }

        public int Count { get; set; }

        [StringLength(1000)]
        public string? Comment { get; set; }
    }
}