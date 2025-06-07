using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BreakingNewGround.Server.DAL.Data
{
    [Table("medicines")]
    [Index(nameof(BodyTypeId))]
    [Index(nameof(TypeId))]
    public class Medicine
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("name")]
        public required string Name { get; set; }

        [Column("expiration_date")]
        public DateOnly? ExpirationDate { get; set; }

        [Column("body_type_id")]
        [ForeignKey(nameof(BodyType))]
        public long BodyTypeId { get; set; }

        [DeleteBehavior(DeleteBehavior.SetNull)]
        public virtual MedicineBodyType BodyType { get; set; } = null!;

        [Column("type_id")]
        [ForeignKey(nameof(Type))]
        public long TypeId { get; set; }

        [DeleteBehavior(DeleteBehavior.SetNull)]
        public virtual MedicineType Type { get; set; } = null!;

        [Column("count")]
        public int Count { get; set; }

        [Column("comment")]
        public string? Comment { get; set; }
    }
}