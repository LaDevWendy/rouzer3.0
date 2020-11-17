using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class ban : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Estado",
                table: "Comentarios",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Bans",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    Creacion = table.Column<DateTimeOffset>(nullable: false),
                    UsuarioId = table.Column<string>(nullable: true),
                    ModId = table.Column<string>(nullable: true),
                    Expiracion = table.Column<DateTimeOffset>(nullable: false),
                    Tipo = table.Column<int>(nullable: false),
                    HiloId = table.Column<string>(nullable: true),
                    ComentarioId = table.Column<string>(nullable: true),
                    Motivo = table.Column<int>(nullable: false),
                    Aclaracion = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bans", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bans");

            migrationBuilder.DropColumn(
                name: "Estado",
                table: "Comentarios");
        }
    }
}
