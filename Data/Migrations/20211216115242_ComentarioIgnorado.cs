using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class ComentarioIgnorado : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Ignorado",
                table: "Comentarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ignorado",
                table: "Comentarios");
        }
    }
}
