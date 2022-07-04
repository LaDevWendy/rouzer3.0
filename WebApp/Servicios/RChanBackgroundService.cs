using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Servicios
{
    public class RChanBackgroundService : IHostedService, IDisposable
    {
        private readonly IServiceProvider services;
        private readonly ILogger<RChanBackgroundService> logger;
        private Timer timer;

        public RChanBackgroundService(IServiceProvider services, ILogger<RChanBackgroundService> logger)
        {
            this.services = services;
            this.logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            timer = new Timer(async (state) =>
            {
                await LimpearHilosViejos();
                await LimpearMensajesGlobalesViejos();
            }, null, 0, (int)TimeSpan.FromMinutes(60).TotalMilliseconds);
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            timer.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public async Task LimpearHilosViejos()
        {
            try
            {
                logger.LogInformation("[RBS] Comenzando limpieza de hilos viejos...");
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

        public async Task LimpearMensajesGlobalesViejos()
        {
            logger.LogInformation("[RBS] Comenzando limpieza de mensajes globales viejos...");
            using var scope = services.CreateScope();
            var premiumService = scope.ServiceProvider.GetService<PremiumService>();
            await premiumService.LimpiarMensajesGlobalesViejos();
            logger.LogInformation("[RBS] Limpieza terminada");
        }

        public void Dispose()
        {
            timer?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
