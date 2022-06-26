using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class Pedidos : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Pedidos",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UsuarioId = table.Column<string>(type: "text", nullable: true),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Paquete = table.Column<int>(type: "integer", nullable: false),
                    Metodo = table.Column<int>(type: "integer", nullable: false),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    CodigoMembreciaId = table.Column<string>(type: "text", nullable: true),
                    CodigoPaqueteId = table.Column<string>(type: "text", nullable: true),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pedidos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pedidos_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Pedidos_CodigosPremium_CodigoMembreciaId",
                        column: x => x.CodigoMembreciaId,
                        principalTable: "CodigosPremium",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Pedidos_CodigosPremium_CodigoPaqueteId",
                        column: x => x.CodigoPaqueteId,
                        principalTable: "CodigosPremium",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_CodigoMembreciaId",
                table: "Pedidos",
                column: "CodigoMembreciaId");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_CodigoPaqueteId",
                table: "Pedidos",
                column: "CodigoPaqueteId");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_UsuarioId",
                table: "Pedidos",
                column: "UsuarioId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Pedidos");
        }
    }
}
