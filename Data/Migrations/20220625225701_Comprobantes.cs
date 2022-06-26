using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class Comprobantes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ComprobanteId",
                table: "Pedidos",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Comprobantes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Format = table.Column<string>(type: "text", nullable: true),
                    Path = table.Column<string>(type: "text", nullable: true),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comprobantes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_ComprobanteId",
                table: "Pedidos",
                column: "ComprobanteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Comprobantes_ComprobanteId",
                table: "Pedidos",
                column: "ComprobanteId",
                principalTable: "Comprobantes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Comprobantes_ComprobanteId",
                table: "Pedidos");

            migrationBuilder.DropTable(
                name: "Comprobantes");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_ComprobanteId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "ComprobanteId",
                table: "Pedidos");
        }
    }
}
