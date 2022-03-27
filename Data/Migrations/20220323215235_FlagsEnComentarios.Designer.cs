﻿// <auto-generated />
using System;
using Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Data.Migrations
{
    [DbContext(typeof(RChanContext))]
    [Migration("20220323215235_FlagsEnComentarios")]
    partial class FlagsEnComentarios
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Relational:MaxIdentifierLength", 63)
                .HasAnnotation("ProductVersion", "5.0.7")
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole<string>", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasDatabaseName("RoleNameIndex");

                    b.ToTable("AspNetRoles");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<string>("ClaimType")
                        .HasColumnType("text");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("text");

                    b.Property<string>("RoleId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<string>("ClaimType")
                        .HasColumnType("text");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("text");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasMaxLength(128)
                        .HasColumnType("character varying(128)");

                    b.Property<string>("ProviderKey")
                        .HasMaxLength(128)
                        .HasColumnType("character varying(128)");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("text");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("text");

                    b.Property<string>("RoleId")
                        .HasColumnType("text");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("text");

                    b.Property<string>("LoginProvider")
                        .HasMaxLength(128)
                        .HasColumnType("character varying(128)");

                    b.Property<string>("Name")
                        .HasMaxLength(128)
                        .HasColumnType("character varying(128)");

                    b.Property<string>("Value")
                        .HasColumnType("text");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens");
                });

            modelBuilder.Entity("Modelos.AccionDeModeracion", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("BanId")
                        .HasColumnType("text");

                    b.Property<string>("ComentarioId")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Creacion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("DenunciaId")
                        .HasColumnType("text");

                    b.Property<string>("HiloId")
                        .HasColumnType("text");

                    b.Property<string>("Nota")
                        .HasColumnType("text");

                    b.Property<int>("Tipo")
                        .HasColumnType("integer");

                    b.Property<int>("TipoElemento")
                        .HasColumnType("integer");

                    b.Property<string>("UsuarioId")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("BanId");

                    b.HasIndex("ComentarioId");

                    b.HasIndex("DenunciaId");

                    b.HasIndex("HiloId");

                    b.HasIndex("UsuarioId");

                    b.ToTable("AccionesDeModeracion");
                });

            modelBuilder.Entity("Modelos.AudioModel", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Creacion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Url")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Audios");
                });

            modelBuilder.Entity("Modelos.BaneoModel", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("Aclaracion")
                        .HasColumnType("text");

                    b.Property<string>("ComentarioId")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Creacion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<DateTimeOffset>("Expiracion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("FingerPrint")
                        .HasColumnType("text");

                    b.Property<string>("HiloId")
                        .HasColumnType("text");

                    b.Property<string>("Ip")
                        .HasColumnType("text");

                    b.Property<string>("ModId")
                        .HasColumnType("text");

                    b.Property<int>("Motivo")
                        .HasColumnType("integer");

                    b.Property<int>("Tipo")
                        .HasColumnType("integer");

                    b.Property<string>("UsuarioId")
                        .HasColumnType("text");

                    b.Property<bool>("Visto")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("ComentarioId");

                    b.HasIndex("Expiracion");

                    b.HasIndex("HiloId");

                    b.HasIndex("Ip");

                    b.HasIndex("UsuarioId");

                    b.ToTable("Bans");
                });

            modelBuilder.Entity("Modelos.ComentarioModel", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("AudioId")
                        .HasColumnType("text");

                    b.Property<string>("Contenido")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Creacion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("Estado")
                        .HasColumnType("integer");

                    b.Property<string>("FingerPrint")
                        .HasColumnType("text");

                    b.Property<string>("Flags")
                        .HasColumnType("text");

                    b.Property<string>("HiloId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("Ignorado")
                        .HasColumnType("boolean");

                    b.Property<string>("Ip")
                        .HasColumnType("text");

                    b.Property<string>("MediaId")
                        .HasColumnType("text");

                    b.Property<string>("Nombre")
                        .HasColumnType("text");

                    b.Property<string>("Pais")
                        .HasColumnType("text");

                    b.Property<int>("Rango")
                        .HasColumnType("integer");

                    b.Property<bool>("Sticky")
                        .HasColumnType("boolean");

                    b.Property<string>("UsuarioId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("AudioId");

                    b.HasIndex("HiloId");

                    b.HasIndex("MediaId");

                    b.HasIndex("UsuarioId");

                    b.ToTable("Comentarios");
                });

            modelBuilder.Entity("Modelos.DenunciaModel", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("Aclaracion")
                        .HasColumnType("text");

                    b.Property<string>("ComentarioId")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Creacion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("Estado")
                        .HasColumnType("integer");

                    b.Property<string>("HiloId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("Motivo")
                        .HasColumnType("integer");

                    b.Property<int>("Tipo")
                        .HasColumnType("integer");

                    b.Property<string>("UsuarioId")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("ComentarioId");

                    b.HasIndex("HiloId");

                    b.HasIndex("UsuarioId");

                    b.ToTable("Denuncias");
                });

            modelBuilder.Entity("Modelos.HiloAccionModel", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Creacion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("Favorito")
                        .HasColumnType("boolean");

                    b.Property<bool>("Hideado")
                        .HasColumnType("boolean");

                    b.Property<string>("HiloId")
                        .HasColumnType("text");

                    b.Property<bool>("Seguido")
                        .HasColumnType("boolean");

                    b.Property<string>("UsuarioId")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("HiloId");

                    b.HasIndex("UsuarioId");

                    b.ToTable("HiloAcciones");
                });

            modelBuilder.Entity("Modelos.HiloModel", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("AudioId")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Bump")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("CategoriaId")
                        .HasColumnType("integer");

                    b.Property<string>("Contenido")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Creacion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Encuesta")
                        .HasColumnType("text");

                    b.Property<int>("Estado")
                        .HasColumnType("integer");

                    b.Property<string>("FingerPrint")
                        .HasColumnType("text");

                    b.Property<string>("Flags")
                        .HasColumnType("text");

                    b.Property<string>("Ip")
                        .HasColumnType("text");

                    b.Property<string>("MediaId")
                        .HasColumnType("text");

                    b.Property<string>("Nombre")
                        .HasColumnType("text");

                    b.Property<string>("Pais")
                        .HasColumnType("text");

                    b.Property<int>("Rango")
                        .HasColumnType("integer");

                    b.Property<string>("Titulo")
                        .HasColumnType("text");

                    b.Property<double>("TrendIndex")
                        .HasColumnType("double precision");

                    b.Property<string>("UsuarioId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("AudioId");

                    b.HasIndex("Bump");

                    b.HasIndex("MediaId");

                    b.HasIndex("UsuarioId");

                    b.ToTable("Hilos");
                });

            modelBuilder.Entity("Modelos.MediaModel", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Creacion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Hash")
                        .HasColumnType("text");

                    b.Property<int>("Tipo")
                        .HasColumnType("integer");

                    b.Property<string>("Url")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Medias");
                });

            modelBuilder.Entity("Modelos.NotificacionModel", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Actualizacion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("ComentarioId")
                        .HasColumnType("text");

                    b.Property<int>("Conteo")
                        .HasColumnType("integer");

                    b.Property<string>("HiloId")
                        .HasColumnType("text");

                    b.Property<int>("Tipo")
                        .HasColumnType("integer");

                    b.Property<string>("UsuarioId")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("ComentarioId");

                    b.HasIndex("HiloId");

                    b.HasIndex("UsuarioId");

                    b.ToTable("Notificaciones");
                });

            modelBuilder.Entity("Modelos.SpamModel", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Creacion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<TimeSpan>("Duracion")
                        .HasColumnType("interval");

                    b.Property<string>("Link")
                        .HasColumnType("text");

                    b.Property<bool>("Nsfw")
                        .HasColumnType("boolean");

                    b.Property<string>("UrlImagen")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Spams");
                });

            modelBuilder.Entity("Modelos.Sticky", b =>
                {
                    b.Property<string>("HiloId")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Expiracion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("Global")
                        .HasColumnType("boolean");

                    b.Property<int>("Importancia")
                        .HasColumnType("integer");

                    b.HasKey("HiloId");

                    b.ToTable("Stickies");
                });

            modelBuilder.Entity("Modelos.UsuarioModel", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<int>("AccessFailedCount")
                        .HasColumnType("integer");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Creacion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("boolean");

                    b.Property<string>("FingerPrint")
                        .HasColumnType("text");

                    b.Property<string>("Ip")
                        .HasColumnType("text");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("boolean");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("text");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("text");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("boolean");

                    b.Property<string>("SecurityStamp")
                        .HasColumnType("text");

                    b.Property<string>("Token")
                        .HasColumnType("text");

                    b.Property<bool>("TwoFactorEnabled")
                        .HasColumnType("boolean");

                    b.Property<string>("UserName")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasDatabaseName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasDatabaseName("UserNameIndex");

                    b.ToTable("AspNetUsers");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole<string>", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("Modelos.UsuarioModel", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("Modelos.UsuarioModel", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole<string>", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Modelos.UsuarioModel", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("Modelos.UsuarioModel", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Modelos.AccionDeModeracion", b =>
                {
                    b.HasOne("Modelos.BaneoModel", "Ban")
                        .WithMany()
                        .HasForeignKey("BanId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.HasOne("Modelos.ComentarioModel", "Comentario")
                        .WithMany()
                        .HasForeignKey("ComentarioId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.HasOne("Modelos.DenunciaModel", "Denuncia")
                        .WithMany()
                        .HasForeignKey("DenunciaId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.HasOne("Modelos.HiloModel", "Hilo")
                        .WithMany()
                        .HasForeignKey("HiloId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.HasOne("Modelos.UsuarioModel", "Usuario")
                        .WithMany()
                        .HasForeignKey("UsuarioId");

                    b.Navigation("Ban");

                    b.Navigation("Comentario");

                    b.Navigation("Denuncia");

                    b.Navigation("Hilo");

                    b.Navigation("Usuario");
                });

            modelBuilder.Entity("Modelos.BaneoModel", b =>
                {
                    b.HasOne("Modelos.ComentarioModel", "Comentario")
                        .WithMany()
                        .HasForeignKey("ComentarioId");

                    b.HasOne("Modelos.HiloModel", "Hilo")
                        .WithMany()
                        .HasForeignKey("HiloId");

                    b.HasOne("Modelos.UsuarioModel", "Usuario")
                        .WithMany()
                        .HasForeignKey("UsuarioId");

                    b.Navigation("Comentario");

                    b.Navigation("Hilo");

                    b.Navigation("Usuario");
                });

            modelBuilder.Entity("Modelos.ComentarioModel", b =>
                {
                    b.HasOne("Modelos.AudioModel", "Audio")
                        .WithMany()
                        .HasForeignKey("AudioId");

                    b.HasOne("Modelos.HiloModel", "Hilo")
                        .WithMany("Comentarios")
                        .HasForeignKey("HiloId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Modelos.MediaModel", "Media")
                        .WithMany()
                        .HasForeignKey("MediaId");

                    b.HasOne("Modelos.UsuarioModel", "Usuario")
                        .WithMany()
                        .HasForeignKey("UsuarioId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Audio");

                    b.Navigation("Hilo");

                    b.Navigation("Media");

                    b.Navigation("Usuario");
                });

            modelBuilder.Entity("Modelos.DenunciaModel", b =>
                {
                    b.HasOne("Modelos.ComentarioModel", "Comentario")
                        .WithMany()
                        .HasForeignKey("ComentarioId");

                    b.HasOne("Modelos.HiloModel", "Hilo")
                        .WithMany()
                        .HasForeignKey("HiloId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Modelos.UsuarioModel", "Usuario")
                        .WithMany()
                        .HasForeignKey("UsuarioId");

                    b.Navigation("Comentario");

                    b.Navigation("Hilo");

                    b.Navigation("Usuario");
                });

            modelBuilder.Entity("Modelos.HiloAccionModel", b =>
                {
                    b.HasOne("Modelos.HiloModel", "Hilo")
                        .WithMany()
                        .HasForeignKey("HiloId");

                    b.HasOne("Modelos.UsuarioModel", "Usuario")
                        .WithMany()
                        .HasForeignKey("UsuarioId");

                    b.Navigation("Hilo");

                    b.Navigation("Usuario");
                });

            modelBuilder.Entity("Modelos.HiloModel", b =>
                {
                    b.HasOne("Modelos.AudioModel", "Audio")
                        .WithMany()
                        .HasForeignKey("AudioId");

                    b.HasOne("Modelos.MediaModel", "Media")
                        .WithMany()
                        .HasForeignKey("MediaId");

                    b.HasOne("Modelos.UsuarioModel", "Usuario")
                        .WithMany()
                        .HasForeignKey("UsuarioId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Audio");

                    b.Navigation("Media");

                    b.Navigation("Usuario");
                });

            modelBuilder.Entity("Modelos.MediaModel", b =>
                {
                    b.OwnsOne("Modelos.TgMedia", "TgMedia", b1 =>
                        {
                            b1.Property<string>("MediaModelId")
                                .HasColumnType("text");

                            b1.Property<string>("UrlTgId")
                                .HasColumnType("text");

                            b1.Property<string>("VistaPreviaCuadradoTgId")
                                .HasColumnType("text");

                            b1.Property<string>("VistaPreviaTgId")
                                .HasColumnType("text");

                            b1.HasKey("MediaModelId");

                            b1.ToTable("Medias");

                            b1.WithOwner()
                                .HasForeignKey("MediaModelId");
                        });

                    b.Navigation("TgMedia");
                });

            modelBuilder.Entity("Modelos.NotificacionModel", b =>
                {
                    b.HasOne("Modelos.ComentarioModel", "Comentario")
                        .WithMany()
                        .HasForeignKey("ComentarioId");

                    b.HasOne("Modelos.HiloModel", "Hilo")
                        .WithMany()
                        .HasForeignKey("HiloId");

                    b.HasOne("Modelos.UsuarioModel", null)
                        .WithMany("Notificaciones")
                        .HasForeignKey("UsuarioId");

                    b.Navigation("Comentario");

                    b.Navigation("Hilo");
                });

            modelBuilder.Entity("Modelos.HiloModel", b =>
                {
                    b.Navigation("Comentarios");
                });

            modelBuilder.Entity("Modelos.UsuarioModel", b =>
                {
                    b.Navigation("Notificaciones");
                });
#pragma warning restore 612, 618
        }
    }
}