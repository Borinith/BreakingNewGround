using Microsoft.EntityFrameworkCore;
using System;

namespace BreakingNewGround.Server.DAL.AzureSQL.Views
{
    [Keyless]
    public class ExpirationDateIsClose
    {
        public long Id { get; set; }

        public required string MedicineName { get; set; }

        public DateOnly? ExpirationDate { get; set; }

        public string? MedicineBodyType { get; set; }

        public string? MedicineType { get; set; }

        public int Count { get; set; }

        public string? Comment { get; set; }

        public int RemainingTimeInMonths { get; set; }

        public bool IsExpired { get; set; }
    }
}