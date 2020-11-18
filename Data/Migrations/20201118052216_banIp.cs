using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class banIp : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Ip",
                table: "Bans",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bans_ComentarioId",
                table: "Bans",
                column: "ComentarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Bans_HiloId",
                table: "Bans",
                column: "HiloId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bans_Comentarios_ComentarioId",
                table: "Bans",
                column: "ComentarioId",
                principalTable: "Comentarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bans_Hilos_HiloId",
                table: "Bans",
                column: "HiloId",
                principalTable: "Hilos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bans_Comentarios_ComentarioId",
                table: "Bans");

            migrationBuilder.DropForeignKey(
                name: "FK_Bans_Hilos_HiloId",
                table: "Bans");

            migrationBuilder.DropIndex(
                name: "IX_Bans_ComentarioId",
                table: "Bans");

            migrationBuilder.DropIndex(
                name: "IX_Bans_HiloId",
                table: "Bans");

            migrationBuilder.DropColumn(
                name: "Ip",
                table: "Bans");
        }
    }
}
