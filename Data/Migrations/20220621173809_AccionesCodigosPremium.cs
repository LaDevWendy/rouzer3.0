using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class AccionesCodigosPremium : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Expiracion",
                table: "Balances",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

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

            migrationBuilder.CreateIndex(
                name: "IX_AccionesCodigosPremium_CodigoPremiumId",
                table: "AccionesCodigosPremium",
                column: "CodigoPremiumId");

            migrationBuilder.CreateIndex(
                name: "IX_AccionesCodigosPremium_UsuarioId",
                table: "AccionesCodigosPremium",
                column: "UsuarioId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccionesCodigosPremium");

            migrationBuilder.DropColumn(
                name: "Expiracion",
                table: "Balances");
        }
    }
}
