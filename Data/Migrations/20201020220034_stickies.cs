using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class stickies : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Stickies",
                columns: table => new
                {
                    HiloId = table.Column<string>(nullable: false),
                    Expiracion = table.Column<DateTimeOffset>(nullable: false),
                    Global = table.Column<bool>(nullable: false),
                    Importancia = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stickies", x => x.HiloId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Stickies");
        }
    }
}
