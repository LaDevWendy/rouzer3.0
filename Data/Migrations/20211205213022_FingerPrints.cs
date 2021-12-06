using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class FingerPrints : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FingerPrint",
                table: "Hilos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FingerPrint",
                table: "Comentarios",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FingerPrint",
                table: "Bans",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FingerPrint",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FingerPrint",
                table: "Hilos");

            migrationBuilder.DropColumn(
                name: "FingerPrint",
                table: "Comentarios");

            migrationBuilder.DropColumn(
                name: "FingerPrint",
                table: "Bans");

            migrationBuilder.DropColumn(
                name: "FingerPrint",
                table: "AspNetUsers");
        }
    }
}
