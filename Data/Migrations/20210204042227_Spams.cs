using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class Spams : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Spams",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    Creacion = table.Column<DateTimeOffset>(nullable: false),
                    Duracion = table.Column<TimeSpan>(nullable: false),
                    Nsfw = table.Column<bool>(nullable: false),
                    Link = table.Column<string>(nullable: true),
                    UrlImagen = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Spams", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Spams");
        }
    }
}
