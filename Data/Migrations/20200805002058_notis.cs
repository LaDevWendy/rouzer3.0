using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class notis : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "AspNetUsers");

            migrationBuilder.CreateTable(
                name: "Notificaciones",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    UsuarioId = table.Column<string>(nullable: true),
                    HiloId = table.Column<string>(nullable: true),
                    ComentarioId = table.Column<string>(nullable: true),
                    Tipo = table.Column<int>(nullable: false),
                    Actualizacion = table.Column<DateTimeOffset>(nullable: false),
                    HiloModelId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notificaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notificaciones_Comentarios_ComentarioId",
                        column: x => x.ComentarioId,
                        principalTable: "Comentarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notificaciones_Hilos_HiloModelId",
                        column: x => x.HiloModelId,
                        principalTable: "Hilos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notificaciones_ComentarioId",
                table: "Notificaciones",
                column: "ComentarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Notificaciones_HiloModelId",
                table: "Notificaciones",
                column: "HiloModelId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notificaciones");

            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
