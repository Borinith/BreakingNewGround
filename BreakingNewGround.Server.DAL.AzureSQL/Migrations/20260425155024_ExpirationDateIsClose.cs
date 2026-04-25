using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BreakingNewGround.Server.DAL.AzureSQL.Migrations
{
    /// <inheritdoc />
    public partial class ExpirationDateIsClose : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE VIEW ExpirationDateIsClose AS
SELECT Medicines.Id AS Id,
       Medicines.Name AS MedicineName,
       Medicines.ExpirationDate AS ExpirationDate,
       mbt.Name AS MedicineBodyType,
       mt.Name AS MedicineType,
       Medicines.Count AS Count,
       Medicines.Comment AS Comment,
       IIF(ExpirationDate < GETDATE(), 0, DATEDIFF(month, DATEADD(DAY, -DAY(GETDATE())+1,GETDATE()), DATEADD(DAY,-DAY(GETDATE())+1, ExpirationDate))) AS RemainingTimeInMonths,
       CAST(IIF(ExpirationDate IS NULL, 0, IIF(ExpirationDate < GETDATE(), 1, 0)) AS BIT) AS IsExpired
FROM Medicines
         LEFT JOIN MedicineBodyTypes mbt ON Medicines.BodyTypeId = mbt.Id
         LEFT JOIN MedicineTypes mt ON Medicines.TypeId = mt.Id
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS ExpirationDateIsClose");
        }
    }
}
