using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class Banderitas : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Pais",
                table: "Hilos",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Pais",
                table: "Comentarios",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Pais",
                table: "Hilos");

            migrationBuilder.DropColumn(
                name: "Pais",
                table: "Comentarios");
        }
    }
}
