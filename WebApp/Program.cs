using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Modelos;

namespace WebApp
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            // CreateHostBuilder(args).Build().Run();
            var host = CreateHostBuilder(args).Build();

            // //Agrego Un administrador si no existe
            using (var scope = host.Services.CreateScope())
            {
                var um = scope.ServiceProvider.GetService<SignInManager<UsuarioModel>>().UserManager;
                var admin = (await um.GetUsersForClaimAsync(new Claim("Role", "admin"))).FirstOrDefault();

                if(admin is null)
                {
                    var pepe = um.Users.FirstOrDefault(u =>u.UserName == "pepe");
                    await um.AddClaimAsync(pepe, new Claim("Role", "admin"));
                }
            }

            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>()
                        .UseUrls("https://localhost:5001/","http://localhost:5000/", "https://192.168.0.4:5000/");
                });
    }
}
