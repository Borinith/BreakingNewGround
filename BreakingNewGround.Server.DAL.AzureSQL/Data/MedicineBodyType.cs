using System.ComponentModel.DataAnnotations;

namespace BreakingNewGround.Server.DAL.AzureSQL.Data
{
    public class MedicineBodyType
    {
        [Key]
        public long Id { get; set; }

        [Required]
        [StringLength(50)]
        public required string Name { get; set; }
    }
}