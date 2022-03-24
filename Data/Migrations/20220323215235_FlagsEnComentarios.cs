using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class FlagsEnComentarios : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Flags",
                table: "Comentarios",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Flags",
                table: "Comentarios");
        }
    }
}
