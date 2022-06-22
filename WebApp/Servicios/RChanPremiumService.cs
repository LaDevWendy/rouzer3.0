﻿using Microsoft.Extensions.Logging;
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
        private Timer timer;

        public List<HiloViewModel> hilosIndex { get; private set; } = new List<HiloViewModel>();

        public RChanPremiumService(IServiceProvider services, ILogger<RChanTrendService> logger)
        {
            this.services = services;
            this.logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            timer = new Timer(async (state) =>
            {
                await ActualizarPremiums();
            }, null, 0, (int)TimeSpan.FromHours(12).TotalMilliseconds);
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            timer.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public async Task ActualizarPremiums()
        {
            logger.LogInformation("Actualizando premiums...");
            using var scope = services.CreateScope();
            var premiumService = scope.ServiceProvider.GetService<PremiumService>();
            await premiumService.ActualizarPremiums();
        }

        public void Dispose()
        {
            timer?.Dispose();
        }
    }
}

