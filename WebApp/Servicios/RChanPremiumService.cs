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
    public class RChanPremiumService : IHostedService, IDisposable
    {
        private readonly IServiceProvider services;
        private readonly ILogger<RChanTrendService> logger;
        private Timer timer1;
        private Timer timer2;
        private const int interval = 10;

        public RChanPremiumService(IServiceProvider services, ILogger<RChanTrendService> logger)
        {
            this.services = services;
            this.logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            timer1 = new Timer(async (state) => { await ActualizarPremiums(); }, null, 0, (int)TimeSpan.FromHours(12).TotalMilliseconds);
            timer2 = new Timer(async (state) => { await ActualizarWares();
                await ResolverJuegos(); },
                null,
                (int)TimeSpan.FromSeconds(interval).TotalMilliseconds,
                (int)TimeSpan.FromSeconds(interval).TotalMilliseconds);
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            timer1.Change(Timeout.Infinite, 0);
            timer2.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public async Task ActualizarPremiums()
        {
            logger.LogInformation("Actualizando premiums...");
            using var scope = services.CreateScope();
            var premiumService = scope.ServiceProvider.GetService<PremiumService>();
            await premiumService.ActualizarPremiums();
        }

        public async Task ActualizarWares()
        {
            using var scope = services.CreateScope();
            var premiumService = scope.ServiceProvider.GetService<PremiumService>();
            await premiumService.ActualizarWares(interval);
        }

        public async Task ResolverJuegos()
        {
            using var scope = services.CreateScope();
            var lobbyService = scope.ServiceProvider.GetService<LobbyService>();
            await lobbyService.ResolverJuegos();
        }

        public void Dispose()
        {
            timer1?.Dispose();
            timer2?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}

