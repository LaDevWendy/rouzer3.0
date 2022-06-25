using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class Premium : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Balances",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UsuarioId = table.Column<string>(type: "text", nullable: false),
                    Balance = table.Column<float>(type: "real", nullable: false),
                    Expiracion = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Balances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Balances_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CodigosPremium",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Expiracion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<float>(type: "real", nullable: false),
                    Usos = table.Column<int>(type: "integer", nullable: false),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodigosPremium", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Transacciones",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UsuarioId = table.Column<string>(type: "text", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    OrigenCantidad = table.Column<float>(type: "real", nullable: false),
                    DestinoCantidad = table.Column<float>(type: "real", nullable: false),
                    OrigenUnidad = table.Column<string>(type: "text", nullable: true),
                    DestinoUnidad = table.Column<string>(type: "text", nullable: true),
                    Balance = table.Column<float>(type: "real", nullable: false),
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
                name: "AccionesCodigosPremium",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UsuarioId = table.Column<string>(type: "text", nullable: false),
                    CodigoPremiumId = table.Column<string>(type: "text", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccionesCodigosPremium", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccionesCodigosPremium_AspNetUsers_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AccionesCodigosPremium_CodigosPremium_CodigoPremiumId",
                        column: x => x.CodigoPremiumId,
                        principalTable: "CodigosPremium",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AutoBumps",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    HiloId = table.Column<string>(type: "text", nullable: true),
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
                        onDelete: ReferentialAction.SetNull);
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
                name: "IX_AccionesCodigosPremium_CodigoPremiumId",
                table: "AccionesCodigosPremium",
                column: "CodigoPremiumId");

            migrationBuilder.CreateIndex(
                name: "IX_AccionesCodigosPremium_UsuarioId",
                table: "AccionesCodigosPremium",
                column: "UsuarioId");

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
                name: "IX_Balances_UsuarioId",
                table: "Balances",
                column: "UsuarioId",
                unique: true);

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
                name: "AccionesCodigosPremium");

            migrationBuilder.DropTable(
                name: "AutoBumps");

            migrationBuilder.DropTable(
                name: "Balances");

            migrationBuilder.DropTable(
                name: "MensajesGlobales");

            migrationBuilder.DropTable(
                name: "CodigosPremium");

            migrationBuilder.DropTable(
                name: "Transacciones");
        }
    }
}
