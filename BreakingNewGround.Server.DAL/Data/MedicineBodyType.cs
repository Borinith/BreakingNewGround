using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BreakingNewGround.Server.DAL.Data
{
    [Table("medicine_body_type")]
    public class MedicineBodyType
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("name")]
        public required string Name { get; set; }
    }
}