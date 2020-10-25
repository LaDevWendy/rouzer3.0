using Microsoft.EntityFrameworkCore.Migrations;

namespace Data.Migrations
{
    public partial class denuncias : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Motivo",
                table: "Denuncias",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "HiloId",
                table: "Denuncias",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Aclaracion",
                table: "Denuncias",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ComentarioId",
                table: "Denuncias",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Estado",
                table: "Denuncias",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Tipo",
                table: "Denuncias",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "UsuarioId",
                table: "Denuncias",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Aclaracion",
                table: "Denuncias");

            migrationBuilder.DropColumn(
                name: "ComentarioId",
                table: "Denuncias");

            migrationBuilder.DropColumn(
                name: "Estado",
                table: "Denuncias");

            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "Denuncias");

            migrationBuilder.DropColumn(
                name: "UsuarioId",
                table: "Denuncias");

            migrationBuilder.AlterColumn<string>(
                name: "Motivo",
                table: "Denuncias",
                type: "text",
                nullable: true,
                oldClrType: typeof(string));

            migrationBuilder.AlterColumn<string>(
                name: "HiloId",
                table: "Denuncias",
                type: "text",
                nullable: true,
                oldClrType: typeof(string));
        }
    }
}
