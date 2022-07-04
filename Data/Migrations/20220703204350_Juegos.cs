using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class Juegos : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Juegos",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    Expiracion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    HiloId = table.Column<string>(type: "text", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Juegos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Juegos_Hilos_HiloId",
                        column: x => x.HiloId,
                        principalTable: "Hilos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Apuestas",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UsuarioId = table.Column<string>(type: "text", nullable: false),
                    JuegoId = table.Column<string>(type: "text", nullable: true),
                    ComentarioId = table.Column<string>(type: "text", nullable: false),
                    Apuesta = table.Column<string>(type: "text", nullable: true),
                    Cantidad = table.Column<float>(type: "real", nullable: false),
                    TransaccionId = table.Column<string>(type: "text", nullable: true),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Apuestas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Apuestas_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Apuestas_Comentarios_ComentarioId",
                        column: x => x.ComentarioId,
                        principalTable: "Comentarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Apuestas_Juegos_JuegoId",
                        column: x => x.JuegoId,
                        principalTable: "Juegos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Apuestas_Transacciones_TransaccionId",
                        column: x => x.TransaccionId,
                        principalTable: "Transacciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Apuestas_ComentarioId",
                table: "Apuestas",
                column: "ComentarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Apuestas_JuegoId",
                table: "Apuestas",
                column: "JuegoId");

            migrationBuilder.CreateIndex(
                name: "IX_Apuestas_TransaccionId",
                table: "Apuestas",
                column: "TransaccionId");

            migrationBuilder.CreateIndex(
                name: "IX_Apuestas_UsuarioId",
                table: "Apuestas",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Juegos_HiloId",
                table: "Juegos",
                column: "HiloId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Apuestas");

            migrationBuilder.DropTable(
                name: "Juegos");
        }
    }
}
