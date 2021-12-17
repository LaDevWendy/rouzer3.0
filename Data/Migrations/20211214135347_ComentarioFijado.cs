using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class ComentarioFijado : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Sticky",
                table: "Comentarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Sticky",
                table: "Comentarios");
        }
    }
}
