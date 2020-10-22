using System;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore;
using Modelos;
using Microsoft.AspNetCore.Identity;

namespace Data
{

    public class RChanContext : IdentityDbContext<UsuarioModel, IdentityRole<string>, string>
    {
        private readonly string connectionString;

        public RChanContext(DbContextOptions<RChanContext> options) : base(options)
        {
        }
        public RChanContext(string connectionString)
        {
            this.connectionString = connectionString;
        }
        public RChanContext() {}

        public DbSet<HiloModel> Hilos { get; set; }
        public DbSet<HiloAccionModel> HiloAcciones { get; set; }
        public DbSet<ComentarioModel> Comentarios { get; set; }
        public DbSet<MediaModel> Medias { get; set; }
        public DbSet<UsuarioModel> Usuarios { get; set; }
        public DbSet<NotificacionModel> Notificaciones{ get; set; }
        public DbSet<DenunciaModel> Denuncias { get; set; }
        public DbSet<Sticky> Stickies { get; set; }

        override protected void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // if (string.IsNullOrEmpty(connectionString))
            // {
            //     base.OnConfiguring(optionsBuilder);
            // }
            // else
            // {
                optionsBuilder.UseNpgsql(connectionString ?? "Server=127.0.0.1;Port=5433;Database=RChanTest;User Id=postgres;Password=jejetabien;");
                //optionsBuilder.UseNpgsql( "Server=127.0.0.1;Port=5433;Database=RChanTest;User Id=postgres;Password=jejetabien;");
            // }
        }
    }
}
