using Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Modelos;
using Servicios;
using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace WebApp
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            // CreateHostBuilder(args).Build().Run();
            var host = CreateHostBuilder(args).Build();

            //Creo la carpeta almacenamiento si no existe
            Directory.CreateDirectory("Almacenamiento");
            Directory.CreateDirectory("Audios");
            Directory.CreateDirectory("Comprobantes");
            // //Agrego Un administrador si no existe
            using (var scope = host.Services.CreateScope())
            {
                var logger = scope.ServiceProvider.GetService<ILogger<Program>>();
                var ctx = scope.ServiceProvider.GetService<RChanContext>();
                var aspenv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                var opt = scope.ServiceProvider.GetService<IConfiguration>();
                var wh = scope.ServiceProvider.GetService<IWebHostEnvironment>();
                var comentarioService = scope.ServiceProvider.GetService<IComentarioService>();
                var hiloService = scope.ServiceProvider.GetService<IHiloService>();
                var hash = scope.ServiceProvider.GetService<HashService>();

                var migs = await ctx.Database.GetPendingMigrationsAsync();

                if (migs.Any())
                {
                    var migrations = ctx.Database.GetPendingMigrations();
                    logger.LogInformation("Applicando migraciones pendientes");
                    try
                    {
                        await ctx.Database.MigrateAsync();
                    }
                    catch (Exception e)
                    {
                        logger.LogError("Error al applicar las migraciones");
                        Console.WriteLine(e);
                    }
                }

                var um = scope.ServiceProvider.GetService<SignInManager<UsuarioModel>>().UserManager;

                var dev = (await um.GetUsersForClaimAsync(new Claim("Role", "dev"))).FirstOrDefault();

                if (dev is null)
                {
                    var pepe = um.Users.FirstOrDefault(u => u.UserName == "pepe");
                    if (pepe is null)
                    {
                        var r = await um.CreateAsync(new UsuarioModel { UserName = "pepe" }, "contraseña");
                    }
                    pepe = um.Users.FirstOrDefault(u => u.UserName == "pepe");
                    await um.AddClaimAsync(pepe, new Claim("Role", "dev"));
                }

                var bot = (await um.GetUsersForClaimAsync(new Claim("Role", "bot"))).FirstOrDefault();
                if (bot is null)
                {
                    var RouzedBot = um.Users.FirstOrDefault(u => u.UserName == "RouzedBot");
                    if (RouzedBot is null)
                    {
                        // Cambiar contraseña
                        var r = await um.CreateAsync(new UsuarioModel { UserName = "RouzedBot" }, "contraseña");
                    }
                    RouzedBot = um.Users.FirstOrDefault(u => u.UserName == "RouzedBot");
                    await um.AddClaimAsync(RouzedBot, new Claim("Role", "bot"));
                }

                // Inicializar estadisticas
                var estadisticasService = scope.ServiceProvider.GetService<EstadisticasService>();

                await estadisticasService.Inicializar(
                    new Estadisticas
                    {
                        ComentariosCreados = ctx.Comentarios.Count(),
                        HilosCreados = ctx.Hilos.Count(),
                    }
                );

                var mediaService = scope.ServiceProvider.GetService<IMediaService>();
                await mediaService.GenerarMediasBot();
            }

            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(
                    webBuilder =>
                    {
                        webBuilder
                            .ConfigureAppConfiguration(
                                cb =>
                                {
                                    cb.AddJsonFile("appsettings.json", false, true);
                                    cb.AddJsonFile("categoriassettings.json", false, true);
                                    cb.AddJsonFile("grupossettings.json", false, true);
                                    cb.AddJsonFile("generalsettings.json", false, true);
                                    cb.AddJsonFile("waressettings.json", false, true);
                                    cb.AddCommandLine(args);
                                    cb.AddEnvironmentVariables();
                                }
                            )
                            .UseStartup<Startup>()
                            .UseUrls("http://0.0.0.0:5000/")
                            .UseKestrel(
                                options =>
                                {
                                    options.Limits.MaxRequestBodySize = 31457280;
                                }
                            );
                    }
                );
    }
}
