using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BreakingNewGround.Server.DAL.AzureSQL.Migrations
{
    /// <inheritdoc />
    public partial class AddImagesUploadedAtUtcIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Images_UploadedAtUtc",
                table: "Images",
                column: "UploadedAtUtc");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Images_UploadedAtUtc",
                table: "Images");
        }
    }
}
