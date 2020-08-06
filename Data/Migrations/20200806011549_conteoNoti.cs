using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class conteoNoti : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Conteo",
                table: "Notificaciones",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Conteo",
                table: "Notificaciones");
        }
    }
}
