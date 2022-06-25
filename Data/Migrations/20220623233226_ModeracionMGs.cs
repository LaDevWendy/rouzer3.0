using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class ModeracionMGs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Estado",
                table: "MensajesGlobales",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Estado",
                table: "MensajesGlobales");
        }
    }
}
