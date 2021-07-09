using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Modelos;

namespace Servicios
{
    public class RChanCacheService : IHostedService, IDisposable
    {
        private readonly IServiceProvider services;
        private readonly ILogger<RChanCacheService> logger;
        private Timer timer;

        public List<HiloViewModel> hilosIndex { get; private set;} = new List<HiloViewModel>();

        public BanCache banCache {get; private set;} = new BanCache();

        private int[] todasLasCategorias;

        public RChanCacheService(IServiceProvider services, ILogger<RChanCacheService> logger)
        {
            this.services = services;
            this.logger = logger;
            todasLasCategorias = services.GetService<IOptions<List<Categoria>>>().Value.Select(c => c.Id).ToArray();

        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            timer = new Timer(async (state) => {
                    var t1 = DateTimeOffset.Now;
                    await ActualizarHilos();
                    // Console.WriteLine("Cache actualizado en " + (DateTimeOffset.Now - t1).TotalMilliseconds);
                    await ActualizarBaneos();
                }, 
                null, 0, (int) TimeSpan.FromSeconds(3).TotalMilliseconds);
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            timer.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public async Task ActualizarHilos() 
        {
            using var scope = services.CreateScope();
            var hiloService = scope.ServiceProvider.GetService<IHiloService>();
            hilosIndex = await hiloService.GetHilosOrdenadosPorBump(new GetHilosOptions {
                Cantidad = 10000,
                IncluirStickies = true,
                CategoriasId = todasLasCategorias,
            });
        }

        public async Task ActualizarBaneos() 
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetService<RChanContext>();

            var ahora = DateTimeOffset.Now;
            banCache.BaneosActivos = await context.Bans
                .Where(b => b.Expiracion > ahora)
                .ToListAsync();

            banCache.IpsBaneadas = banCache.BaneosActivos.Select(b => b.Ip).ToHashSet();
            banCache.IdsBaneadas = banCache.BaneosActivos.Select(b => b.UsuarioId).ToHashSet();
                
        }

        public void Dispose()
        {
            timer?.Dispose();
        }
    }

    public class BanCache
    {
        public List<BaneoModel> BaneosActivos { get; set; } = new List<BaneoModel>();
        public HashSet<string> IpsBaneadas { get; set; }
        public HashSet<string> IdsBaneadas { get; set; }
    }
}
