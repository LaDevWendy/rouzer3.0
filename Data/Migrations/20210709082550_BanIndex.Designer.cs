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
    [Migration("20210709082550_BanIndex")]
    partial class BanIndex
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                .HasAnnotation("ProductVersion", "3.1.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole<string>", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasColumnType("character varying(256)")
                        .HasMaxLength(256);

                    b.Property<string>("NormalizedName")
                        .HasColumnType("character varying(256)")
                        .HasMaxLength(256);

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasName("RoleNameIndex");

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
                        .HasColumnType("text");

                    b.Property<string>("ProviderKey")
                        .HasColumnType("text");

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
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasColumnType("text");

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

                    b.Property<string>("Contenido")
                        .HasColumnType("text");

                    b.Property<DateTimeOffset>("Creacion")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("Estado")
                        .HasColumnType("integer");

                    b.Property<string>("HiloId")
                        .IsRequired()
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

                    b.Property<string>("UsuarioId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

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

                    b.Property<string>("UsuarioId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

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
                        .HasColumnType("character varying(256)")
                        .HasMaxLength(256);

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("boolean");

                    b.Property<string>("Ip")
                        .HasColumnType("text");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("boolean");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("NormalizedEmail")
                        .HasColumnType("character varying(256)")
                        .HasMaxLength(256);

                    b.Property<string>("NormalizedUserName")
                        .HasColumnType("character varying(256)")
                        .HasMaxLength(256);

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
                        .HasColumnType("character varying(256)")
                        .HasMaxLength(256);

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasName("UserNameIndex");

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
                });

            modelBuilder.Entity("Modelos.ComentarioModel", b =>
                {
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
                });

            modelBuilder.Entity("Modelos.HiloAccionModel", b =>
                {
                    b.HasOne("Modelos.HiloModel", "Hilo")
                        .WithMany()
                        .HasForeignKey("HiloId");

                    b.HasOne("Modelos.UsuarioModel", "Usuario")
                        .WithMany()
                        .HasForeignKey("UsuarioId");
                });

            modelBuilder.Entity("Modelos.HiloModel", b =>
                {
                    b.HasOne("Modelos.MediaModel", "Media")
                        .WithMany()
                        .HasForeignKey("MediaId");

                    b.HasOne("Modelos.UsuarioModel", "Usuario")
                        .WithMany()
                        .HasForeignKey("UsuarioId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
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
                });
#pragma warning restore 612, 618
        }
    }
}
