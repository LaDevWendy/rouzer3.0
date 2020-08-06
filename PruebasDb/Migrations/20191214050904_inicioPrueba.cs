using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace PruebasDb.Migrations
{
    public partial class inicioPrueba : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MediaModel",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    Creacion = table.Column<DateTimeOffset>(nullable: false),
                    Url = table.Column<string>(nullable: true),
                    VistaPreviaUrl = table.Column<string>(nullable: true),
                    Hash = table.Column<string>(nullable: true),
                    Tipo = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaModel", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    Creacion = table.Column<DateTimeOffset>(nullable: false),
                    Nick = table.Column<string>(nullable: true),
                    Contraseña = table.Column<string>(nullable: true),
                    Role = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Comentarios",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    Creacion = table.Column<DateTimeOffset>(nullable: false),
                    UsuarioId = table.Column<string>(nullable: true),
                    MediaId = table.Column<string>(nullable: true),
                    Estado = table.Column<int>(nullable: false),
                    HiloId = table.Column<string>(nullable: true),
                    Contenido = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comentarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comentarios_MediaModel_MediaId",
                        column: x => x.MediaId,
                        principalTable: "MediaModel",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Hilos",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    Creacion = table.Column<DateTimeOffset>(nullable: false),
                    UsuarioId = table.Column<string>(nullable: true),
                    MediaId = table.Column<string>(nullable: true),
                    Estado = table.Column<int>(nullable: false),
                    Titulo = table.Column<string>(nullable: true),
                    Contenido = table.Column<string>(nullable: true),
                    Bump = table.Column<DateTimeOffset>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hilos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Hilos_MediaModel_MediaId",
                        column: x => x.MediaId,
                        principalTable: "MediaModel",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comentarios_MediaId",
                table: "Comentarios",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_Hilos_MediaId",
                table: "Hilos",
                column: "MediaId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Comentarios");

            migrationBuilder.DropTable(
                name: "Hilos");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "MediaModel");
        }
    }
}
