using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BreakingNewGround.Server.DAL.SQLite.Data
{
    [Table("medicine_type")]
    public class MedicineType
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("name")]
        public required string Name { get; set; }
    }
}