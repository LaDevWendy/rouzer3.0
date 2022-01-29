using Microsoft.Extensions.Logging;
using Modelos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Servicios;
using Microsoft.Extensions.Hosting;

namespace Servicios
{
    public class RChanTrendService : IHostedService, IDisposable
    {
        private readonly IServiceProvider services;
        private readonly ILogger<RChanTrendService> logger;
        private Timer timer;

        public List<HiloViewModel> hilosIndex { get; private set; } = new List<HiloViewModel>();

        public RChanTrendService(IServiceProvider services, ILogger<RChanTrendService> logger)
        {
            this.services = services;
            this.logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            timer = new Timer(async (state) =>
            {
                await ActualizarTendencias();
            }, null, (int)TimeSpan.FromMinutes(1).TotalMilliseconds, (int)TimeSpan.FromMinutes(10).TotalMilliseconds);
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            timer.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public async Task ActualizarTendencias()
        {
            logger.LogInformation("Actualizando tendencias...");
            using var scope = services.CreateScope();
            var hiloService = scope.ServiceProvider.GetService<IHiloService>();
            await hiloService.ActualizarTendencias();
        }

        public void Dispose()
        {
            timer?.Dispose();
        }
    }
}

