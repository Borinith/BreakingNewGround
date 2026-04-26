using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace BreakingNewGround.Server.DAL.SQLite.Views
{
    [Keyless]
    public class ExpirationDateIsClose
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("medicine_name")]
        public required string MedicineName { get; set; }

        [Column("expiration_date")]
        public DateOnly? ExpirationDate { get; set; }

        [Column("medicine_body_type")]
        public string? MedicineBodyType { get; set; }

        [Column("medicine_type")]
        public string? MedicineType { get; set; }

        [Column("count")]
        public int Count { get; set; }

        [Column("comment")]
        public string? Comment { get; set; }

        [Column("remaining_time_in_months")]
        public int RemainingTimeInMonths { get; set; }

        [Column("is_expired")]
        public int IsExpired { get; set; }
    }
}