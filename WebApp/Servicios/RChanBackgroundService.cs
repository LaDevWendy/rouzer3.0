using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Modelos;
using WebApp;
using System.Linq;

namespace Servicios
{
    public class RChanBackgroundService : IHostedService, IDisposable
    {
        private readonly IHubContext<RChanHub> rChanHub;
        private readonly UserManager<UsuarioModel> userManager;
        private readonly IServiceProvider services;
        private readonly ILogger<RChanBackgroundService> logger;
        private Timer timer;
        private Timer timer2;

        public RChanBackgroundService(IHubContext<RChanHub> rChanHub,
        UserManager<UsuarioModel> userManager,
        IServiceProvider services,
        ILogger<RChanBackgroundService> logger)
        {
            this.rChanHub = rChanHub;
            this.userManager = userManager;
            this.services = services;
            this.logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            timer = new Timer(async (state) => await LimpearHilosViejos(), null, 0, (int) TimeSpan.FromSeconds(60).TotalMilliseconds);
            timer2 = new Timer(async (state) => await RefrescarOnlines(), null, 0, (int) TimeSpan.FromSeconds(1).TotalMilliseconds);

            return Task.CompletedTask;
        }

        public async Task RefrescarOnlines(){

            var admins = await userManager.GetUsersForClaimAsync(new Claim("Role", "admin"));
            var mods = await userManager.GetUsersForClaimAsync(new Claim("Role", "mod"));
            var auxiliares = await userManager.GetUsersForClaimAsync(new Claim("Role", "auxiliar"));
            
            var usuariosConectados = RChanHub.NombresUsuariosConectados;
            
            var adms = admins.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToArray();
            
            var meds = mods.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToArray();
            
            var auxs = auxiliares.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToArray();
            
            var onlines = new List<UsuarioVM>();
            
            foreach (UsuarioVM a in adms){
                if (usuariosConectados.Any(item => item == a.UserName)){
                    onlines.Add(a);
                }
            }
            
            foreach (UsuarioVM m in meds){
                if (usuariosConectados.Any(item => item == m.UserName)){
                    onlines.Add(m);
                }
            }
            
            foreach (UsuarioVM x in auxs){
                if (usuariosConectados.Any(item => item == x.UserName)){
                    onlines.Add(x);
                }
            }

            await rChanHub.Clients.Group("administracion").SendAsync("RefrescarOnlines", onlines);
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            timer.Change(Timeout.Infinite, 0);
            timer2.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public async Task LimpearHilosViejos() 
        {
            try
            {
                logger.LogInformation("[RBS] Comenazondo limpieza de hilos viejos...");
                using var scope = services.CreateScope();
                var hiloService = scope.ServiceProvider.GetService<IHiloService>();
                await hiloService.LimpiarHilosViejos();
                logger.LogInformation("[RBS] Limpieza terminada");
            }
            catch (Exception e)
            {
                logger.LogError("Error al limpiar los hilos viejos");
                logger.LogError(e.Message, e);
            }
        }

        public void Dispose()
        {
            timer?.Dispose();
        }
    }
}
