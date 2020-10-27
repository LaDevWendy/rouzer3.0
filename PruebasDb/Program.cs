using System;
using Modelos;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Npgsql;
//using Dapper;
using System.Text.Json;
using SqlKata;
using SqlKata.Compilers;
using SqlKata.Execution;

namespace PruebasDb
{
    class Program
    {
        static void Main(string[] args)
        {

            using (var conection = new NpgsqlConnection("Server=127.0.0.1;Port=5433;Database=RChan;User Id=postgres;Password=jejetabien;")){
                //var hilos = conection.Query<HiloViewModel>(sql);
                //System.Console.WriteLine(JsonSerializer.Serialize(hilos));
                var compiler = new PostgresCompiler();
                var db = new QueryFactory(conection, compiler);
                var h = db.Query("Hilos as h")
                    .Select("Titulo")
                    .Select("h.Contenido")
                    .SelectRaw(@"count(h.""Id"") as ""Comentarios""")
                    .LeftJoin("Comentarios as c", "c.Id", "h.Id" )
                    .GroupBy("h.Id")
                    .OrderBy("Comentarios")
                    .First<HiloViewModel>()
                    ;
                System.Console.WriteLine(JsonSerializer.Serialize(h));
            }

        }
    }

    class HiloViewModel: HiloModel
    {
        new public int Comentarios { get; set; }
    }
    public class JijoContext : DbContext
    {
        public DbSet<HiloModel> Hilos { get; set; }
        public DbSet<UsuarioModel> Usuarios { get; set; }
        public DbSet<ComentarioModel> Comentarios { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql("Server=127.0.0.1;Port=5433;Database=RChan;User Id=postgres;Password=jejetabien;");
        }
    }
}
