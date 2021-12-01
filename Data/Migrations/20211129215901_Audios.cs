using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class Audios : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Connection");

            migrationBuilder.AddColumn<string>(
                name: "AudioId",
                table: "Hilos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AudioId",
                table: "Comentarios",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Audios",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: false),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Audios", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Hilos_AudioId",
                table: "Hilos",
                column: "AudioId");

            migrationBuilder.CreateIndex(
                name: "IX_Comentarios_AudioId",
                table: "Comentarios",
                column: "AudioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Comentarios_Audios_AudioId",
                table: "Comentarios",
                column: "AudioId",
                principalTable: "Audios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hilos_Audios_AudioId",
                table: "Hilos",
                column: "AudioId",
                principalTable: "Audios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comentarios_Audios_AudioId",
                table: "Comentarios");

            migrationBuilder.DropForeignKey(
                name: "FK_Hilos_Audios_AudioId",
                table: "Hilos");

            migrationBuilder.DropTable(
                name: "Audios");

            migrationBuilder.DropIndex(
                name: "IX_Hilos_AudioId",
                table: "Hilos");

            migrationBuilder.DropIndex(
                name: "IX_Comentarios_AudioId",
                table: "Comentarios");

            migrationBuilder.DropColumn(
                name: "AudioId",
                table: "Hilos");

            migrationBuilder.DropColumn(
                name: "AudioId",
                table: "Comentarios");

            migrationBuilder.CreateTable(
                name: "Connection",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Connected = table.Column<bool>(type: "boolean", nullable: false),
                    ConnectionID = table.Column<string>(type: "text", nullable: false),
                    Creacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UserAgent = table.Column<string>(type: "text", nullable: true),
                    UsuarioModelId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Connection", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Connection_AspNetUsers_UsuarioModelId",
                        column: x => x.UsuarioModelId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Connection_UsuarioModelId",
                table: "Connection",
                column: "UsuarioModelId");
        }
    }
}
