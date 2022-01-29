using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class Trends : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "TrendIndex",
                table: "Hilos",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TrendIndex",
                table: "Hilos");
        }
    }
}
