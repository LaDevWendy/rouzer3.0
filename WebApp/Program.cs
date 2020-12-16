using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Modelos;
using Servicios;

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
            // //Agrego Un administrador si no existe
            using (var scope = host.Services.CreateScope())
            {
                var logger = scope.ServiceProvider.GetService<ILogger<Program>>();
                var ctx = scope.ServiceProvider.GetService<RChanContext>();
                var aspenv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                var opt = scope.ServiceProvider.GetService<IConfiguration>();
                var wh = scope.ServiceProvider.GetService<IWebHostEnvironment>();
                var comentarioService = scope.ServiceProvider.GetService<IComentarioService>();
                var hash = scope.ServiceProvider.GetService<HashService>();
                var hiloService = scope.ServiceProvider.GetService<IHiloService>();

                await hiloService.LimpiarHilo("BCIFHTFWVULKC1GLE5GM");

                // //Prueba limpiar roz
                // var hiloId = "7CTLRORYX0GS02KOME8R";
                // var hilo = await ctx.Hilos.FirstOrDefaultAsync(h => h.Id == hiloId);
                // var acciones = await ctx.HiloAcciones.Where(d => d.HiloId == hiloId).ToListAsync();
                // var notis = await ctx.Notificaciones.Where( n => n.HiloId == hiloId).ToListAsync();

                // ctx.Remove(hilo);
                // ctx.RemoveRange(acciones);
                // ctx.RemoveRange(notis);
                // await ctx.SaveChangesAsync();

                // var comentarios = await ctx.Comentarios.Where(c => c.HiloId == hiloId).ToListAsync();
                // var denuncias = await ctx.Denuncias.Where(d => d.HiloId == hiloId).ToListAsync();
                // var baneos = await ctx.Bans.Where(d => d.HiloId == hiloId).ToListAsync();

                // for (int i = 0; i < 50 ; i--)
                // {
                //     ctx.Add(new ComentarioModel {
                //         Contenido = "alsdfkj",
                //         HiloId = "DU1CVRC0WN220LPKTWFI",
                //         UsuarioId = "b21f6ba5-2019-4937-833b-22beb0d26d42",
                //         Id = hash.Random(8) + "d"
                //     });
                //     System.Console.WriteLine(new Random().Next(2000));
                    
                // }
                // await ctx.SaveChangesAsync();


                System.Console.WriteLine(opt.GetValue<string>("HCaptcha:SiteKey"));
                System.Console.WriteLine(aspenv);
                // await ctx.Database.EnsureCreatedAsync();

                var migs = await ctx.Database.GetPendingMigrationsAsync();

                if(migs.Count() != 0) 
                {
                    var migrations = ctx.Database.GetPendingMigrations();
                    logger.LogInformation("Applicando migraciones pendientes");
                    try
                    {
                        await ctx.Database.MigrateAsync();
                    }
                    catch (System.Exception)
                    {
                        
                        logger.LogError("Error al applicar las migraciones");
                    }

                }
                

                var um = scope.ServiceProvider.GetService<SignInManager<UsuarioModel>>().UserManager;
                
                var admin = (await um.GetUsersForClaimAsync(new Claim("Role", "admin"))).FirstOrDefault();

                if(admin is null)
                {
                    var pepe = um.Users.FirstOrDefault(u =>u.UserName == "pepe");
                    if(pepe is null) {
                        var r = await um.CreateAsync(new UsuarioModel {UserName = "pepe"}, "contraseña");
                    }
                    pepe = um.Users.FirstOrDefault(u =>u.UserName == "pepe");
                    await um.AddClaimAsync(pepe, new Claim("Role", "admin"));
                } 
            }

            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder
                    .ConfigureAppConfiguration(cb => {
                        cb.AddJsonFile("appsettings.json",false, true);
                        cb.AddJsonFile("categoriassettings.json",false, true);
                        cb.AddJsonFile("generalsettings.json",false, true);
                        cb.AddCommandLine(args);
                        cb.AddEnvironmentVariables();
                    })
                    .UseStartup<Startup>()
                        .UseUrls("http://0.0.0.0:5000/");
                });
    }
}
