using System.Net;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class ip : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Ip",
                table: "Hilos",
                nullable: true,
                oldClrType: typeof(IPAddress),
                oldType: "inet",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Ip",
                table: "Comentarios",
                nullable: true,
                oldClrType: typeof(IPAddress),
                oldType: "inet",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Hilos_UsuarioId",
                table: "Hilos",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Denuncias_UsuarioId",
                table: "Denuncias",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Denuncias_AspNetUsers_UsuarioId",
                table: "Denuncias",
                column: "UsuarioId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hilos_AspNetUsers_UsuarioId",
                table: "Hilos",
                column: "UsuarioId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Denuncias_AspNetUsers_UsuarioId",
                table: "Denuncias");

            migrationBuilder.DropForeignKey(
                name: "FK_Hilos_AspNetUsers_UsuarioId",
                table: "Hilos");

            migrationBuilder.DropIndex(
                name: "IX_Hilos_UsuarioId",
                table: "Hilos");

            migrationBuilder.DropIndex(
                name: "IX_Denuncias_UsuarioId",
                table: "Denuncias");

            migrationBuilder.AlterColumn<IPAddress>(
                name: "Ip",
                table: "Hilos",
                type: "inet",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<IPAddress>(
                name: "Ip",
                table: "Comentarios",
                type: "inet",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);
        }
    }
}
