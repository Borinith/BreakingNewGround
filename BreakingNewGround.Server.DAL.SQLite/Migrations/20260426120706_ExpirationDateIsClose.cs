using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BreakingNewGround.Server.DAL.SQLite.Migrations
{
    /// <inheritdoc />
    public partial class ExpirationDateIsClose : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE VIEW expiration_date_is_close AS
SELECT medicines.id AS id,
       medicines.name AS medicine_name,
       medicines.expiration_date AS expiration_date,
       mbt.name AS medicine_body_type,
       mt.name AS medicine_type,
       medicines.count AS count,
       medicines.comment AS comment,
       iif (medicines.expiration_date < datetime(), 0,
            strftime('%Y', medicines.expiration_date, 'start of month', '-1 day') * 12 +
            strftime('%m', medicines.expiration_date, 'start of month', '-1 day') -
            strftime('%Y', datetime()) * 12 -
            strftime('%m', datetime()) +
            (strftime('%d', medicines.expiration_date, '+1 day') = '01'
                OR
             strftime('%d', medicines.expiration_date) >= strftime('%d', datetime())
                )) AS remaining_time_in_months,
       iif (medicines.expiration_date IS NULL, 0, medicines.expiration_date < datetime()) AS is_expired
FROM medicines
         LEFT JOIN medicine_body_type mbt ON medicines.body_type_id = mbt.id
         LEFT JOIN medicine_type mt ON medicines.type_id = mt.id
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS expiration_date_is_close");
        }
    }
}
