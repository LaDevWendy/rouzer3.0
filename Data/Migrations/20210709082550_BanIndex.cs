using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class BanIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Bans_Expiracion",
                table: "Bans",
                column: "Expiracion");

            migrationBuilder.CreateIndex(
                name: "IX_Bans_Ip",
                table: "Bans",
                column: "Ip");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bans_Expiracion",
                table: "Bans");

            migrationBuilder.DropIndex(
                name: "IX_Bans_Ip",
                table: "Bans");
        }
    }
}
