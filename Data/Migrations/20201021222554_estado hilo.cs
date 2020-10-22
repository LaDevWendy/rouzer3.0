using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class estadohilo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Estado",
                table: "Comentarios");

            migrationBuilder.AddColumn<string>(
                name: "HiloModelId",
                table: "Comentarios",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Comentarios_HiloModelId",
                table: "Comentarios",
                column: "HiloModelId");

            migrationBuilder.AddForeignKey(
                name: "FK_Comentarios_Hilos_HiloModelId",
                table: "Comentarios",
                column: "HiloModelId",
                principalTable: "Hilos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comentarios_Hilos_HiloModelId",
                table: "Comentarios");

            migrationBuilder.DropIndex(
                name: "IX_Comentarios_HiloModelId",
                table: "Comentarios");

            migrationBuilder.DropColumn(
                name: "HiloModelId",
                table: "Comentarios");

            migrationBuilder.AddColumn<int>(
                name: "Estado",
                table: "Comentarios",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
