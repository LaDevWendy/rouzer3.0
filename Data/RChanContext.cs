﻿using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Modelos;
using Newtonsoft.Json;

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
        public RChanContext() { }

        public DbSet<HiloModel> Hilos { get; set; }
        public DbSet<HiloAccionModel> HiloAcciones { get; set; }
        public DbSet<ComentarioModel> Comentarios { get; set; }
        public DbSet<MediaModel> Medias { get; set; }
        public DbSet<UsuarioModel> Usuarios { get; set; }
        public DbSet<NotificacionModel> Notificaciones { get; set; }
        public DbSet<DenunciaModel> Denuncias { get; set; }
        public DbSet<Sticky> Stickies { get; set; }
        public DbSet<BaneoModel> Bans { get; set; }
        public DbSet<AccionDeModeracion> AccionesDeModeracion { get; set; }
        public DbSet<SpamModel> Spams { get; set; }
        public DbSet<AudioModel> Audios { get; set; }
        public DbSet<ApelacionModel> Apelaciones { get; set; }
        public DbSet<TransaccionModel> Transacciones { get; set; }
        public DbSet<MensajeGlobalModel> MensajesGlobales { get; set; }
        public DbSet<AutoBumpModel> AutoBumps { get; set; }
        public DbSet<BalanceModel> Balances { get; set; }
        public DbSet<CodigoPremiumModel> CodigosPremium { get; set; }
        public DbSet<AccionCodigoPremiumModel> AccionesCodigosPremium { get; set; }
        public DbSet<DonacionModel> Donaciones { get; set; }
        public DbSet<PedidoCodigoPremiumModel> Pedidos { get; set; }
        public DbSet<ComprobanteModel> Comprobantes { get; set; }
        public DbSet<MediaPropiedadesModel> MediasPropiedades { get; set; }
        public DbSet<JuegoModel> Juegos { get; set; }
        public DbSet<ApuestaModel> Apuestas { get; set; }

        override protected void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseNpgsql(connectionString ?? "Server=127.0.0.1;Port=5433;Database=RozedEnd;User Id=postgres;Password=jejetabien;");
            }
            if (!string.IsNullOrEmpty(connectionString))
            {
            }
            else
            {
                // optionsBuilder.UseNpgsql( "Server=127.0.0.1;Port=5433;Database=RChanTest;User Id=postgres;Password=jejetabien;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<HiloModel>()
                .HasIndex(h => h.Bump);

            var jsonSettings = new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore };
            modelBuilder.Entity<HiloModel>()
                .Property(h => h.Encuesta)
                .HasConversion(
                    v => JsonConvert.SerializeObject(v, jsonSettings),
                    v => JsonConvert.DeserializeObject<Encuesta>(v, jsonSettings)
                );

            modelBuilder.Entity<AccionDeModeracion>()
                .HasOne(a => a.Comentario)
                .WithMany()
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<AccionDeModeracion>()
                .HasOne(a => a.Hilo)
                .WithMany()
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<AccionDeModeracion>()
                .HasOne(a => a.Denuncia)
                .WithMany()
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<AccionDeModeracion>()
                .HasOne(a => a.Ban)
                .WithMany()
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<BalanceModel>()
                .HasOne(b => b.Usuario)
                .WithOne()
                .IsRequired(true);

            modelBuilder.Entity<BaneoModel>().HasIndex(b => b.Expiracion);
            modelBuilder.Entity<BaneoModel>().HasIndex(b => b.Ip);

            modelBuilder.Entity<AutoBumpModel>()
                .HasOne(a => a.Hilo)
                .WithMany()
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<MediaPropiedadesModel>()
                .HasOne(b => b.Media)
                .WithOne()
                .IsRequired(true);

            modelBuilder.Entity<JuegoModel>()
                .HasOne(j => j.Hilo)
                .WithMany()
                .IsRequired(true);

            modelBuilder.Entity<ApuestaModel>()
                .HasOne(j => j.Comentario)
                .WithOne()
                .IsRequired(true);

            modelBuilder.Entity<ApuestaModel>()
                .HasOne(a => a.Usuario)
                .WithMany()
                .IsRequired(true);

        }
    }
}

