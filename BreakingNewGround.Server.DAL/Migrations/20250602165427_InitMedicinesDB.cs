using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BreakingNewGround.Server.DAL.Migrations
{
    /// <inheritdoc />
    public partial class InitMedicinesDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "medicine_body_type",
                columns: table => new
                {
                    id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medicine_body_type", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "medicine_type",
                columns: table => new
                {
                    id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medicine_type", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "medicines",
                columns: table => new
                {
                    id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    name = table.Column<string>(type: "TEXT", nullable: false),
                    expiration_date = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    body_type_id = table.Column<long>(type: "INTEGER", nullable: false),
                    type_id = table.Column<long>(type: "INTEGER", nullable: false),
                    count = table.Column<int>(type: "INTEGER", nullable: false),
                    comment = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medicines", x => x.id);
                    table.ForeignKey(
                        name: "FK_medicines_medicine_body_type_body_type_id",
                        column: x => x.body_type_id,
                        principalTable: "medicine_body_type",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_medicines_medicine_type_type_id",
                        column: x => x.type_id,
                        principalTable: "medicine_type",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_medicines_body_type_id",
                table: "medicines",
                column: "body_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_medicines_type_id",
                table: "medicines",
                column: "type_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "medicines");

            migrationBuilder.DropTable(
                name: "medicine_body_type");

            migrationBuilder.DropTable(
                name: "medicine_type");
        }
    }
}
