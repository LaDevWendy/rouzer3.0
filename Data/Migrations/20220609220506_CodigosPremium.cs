using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class CodigosPremium : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CodigosPremium",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    CreadorId = table.Column<string>(type: "text", nullable: false),
                    Expiracion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<float>(type: "real", nullable: false),
                    Usos = table.Column<int>(type: "integer", nullable: false),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodigosPremium", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodigosPremium_AspNetUsers_CreadorId",
                        column: x => x.CreadorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CodigosPremium_CreadorId",
                table: "CodigosPremium",
                column: "CreadorId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodigosPremium");
        }
    }
}
