using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class banUpdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Visto",
                table: "Bans",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Visto",
                table: "Bans");
        }
    }
}
