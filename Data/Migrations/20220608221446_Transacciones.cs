using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class Transacciones : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Transacciones",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UsuarioId = table.Column<string>(type: "text", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    WareId = table.Column<string>(type: "text", nullable: true),
                    OrigenCantidad = table.Column<float>(type: "real", nullable: false),
                    DestinoCantidad = table.Column<float>(type: "real", nullable: false),
                    OrigenUnidad = table.Column<string>(type: "text", nullable: true),
                    DestinoUnidad = table.Column<string>(type: "text", nullable: true),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transacciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transacciones_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AutoBumps",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    HiloId = table.Column<string>(type: "text", nullable: false),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UsuarioId = table.Column<string>(type: "text", nullable: false),
                    TransaccionId = table.Column<string>(type: "text", nullable: false),
                    Restante = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AutoBumps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AutoBumps_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AutoBumps_Hilos_HiloId",
                        column: x => x.HiloId,
                        principalTable: "Hilos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AutoBumps_Transacciones_TransaccionId",
                        column: x => x.TransaccionId,
                        principalTable: "Transacciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MensajesGlobales",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Tier = table.Column<int>(type: "integer", nullable: false),
                    Mensaje = table.Column<string>(type: "text", nullable: true),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UsuarioId = table.Column<string>(type: "text", nullable: false),
                    TransaccionId = table.Column<string>(type: "text", nullable: false),
                    Restante = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MensajesGlobales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MensajesGlobales_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MensajesGlobales_Transacciones_TransaccionId",
                        column: x => x.TransaccionId,
                        principalTable: "Transacciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AutoBumps_HiloId",
                table: "AutoBumps",
                column: "HiloId");

            migrationBuilder.CreateIndex(
                name: "IX_AutoBumps_TransaccionId",
                table: "AutoBumps",
                column: "TransaccionId");

            migrationBuilder.CreateIndex(
                name: "IX_AutoBumps_UsuarioId",
                table: "AutoBumps",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_MensajesGlobales_TransaccionId",
                table: "MensajesGlobales",
                column: "TransaccionId");

            migrationBuilder.CreateIndex(
                name: "IX_MensajesGlobales_UsuarioId",
                table: "MensajesGlobales",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Transacciones_UsuarioId",
                table: "Transacciones",
                column: "UsuarioId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AutoBumps");

            migrationBuilder.DropTable(
                name: "MensajesGlobales");

            migrationBuilder.DropTable(
                name: "Transacciones");
        }
    }
}
