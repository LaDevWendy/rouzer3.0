using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Modelos;
using NetTools;

namespace Servicios
{
    public class RChanCacheService : IHostedService, IDisposable
    {
        private readonly IServiceProvider services;
        private readonly ILogger<RChanCacheService> logger;
        private Timer timer;
        private Timer timer2;

        public List<HiloViewModel> hilosIndex { get; private set; } = new List<HiloViewModel>();
        public int[] creacionIndex { get; private set; } = new int[10000];
        public int[] trendIndex { get; private set; } = new int[10000];

        public BanCache banCache { get; private set; } = new BanCache();

        private int[] todasLasCategorias;

        private HttpClient client = new HttpClient();
        public List<string> listaVPNs { get; private set; } = new List<string>();
        public ConcurrentDictionary<string, bool> ipsSeguras { get; private set; } = new ConcurrentDictionary<string, bool>();
        public List<MensajeGlobalViewModel> mensajeGlobales { get; private set; } = new List<MensajeGlobalViewModel>();

        public RChanCacheService(IServiceProvider services, ILogger<RChanCacheService> logger)
        {
            this.services = services;
            this.logger = logger;
            todasLasCategorias = services.GetService<IOptions<List<Categoria>>>().Value.Select(c => c.Id).ToArray();
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            timer = new Timer(async (state) =>
            {
                //var t1 = DateTimeOffset.Now;
                await ActualizarHilos();
                // Console.WriteLine("Cache actualizado en " + (DateTimeOffset.Now - t1).TotalMilliseconds);
                await ActualizarBaneos();
                await ActualizarMensajesGlobales();
            }, null, 0, (int)TimeSpan.FromSeconds(4).TotalMilliseconds);
            timer2 = new Timer(async (state) =>
            {
                await ActualizarListaVPNs();
            }, null, 0, (int)TimeSpan.FromHours(24).TotalMilliseconds);
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            timer.Change(Timeout.Infinite, 0);
            timer2.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public async Task ActualizarHilos()
        {
            using var scope = services.CreateScope();
            var hiloService = scope.ServiceProvider.GetService<IHiloService>();
            int count = 0, maxTries = 1;
            while (count < maxTries)
            {
                try
                {
                    hilosIndex = await hiloService.GetHilosOrdenadosPorBump(new GetHilosOptions
                    {
                        Cantidad = 10000,
                        IncluirStickies = true,
                        CategoriasId = todasLasCategorias,
                    });
                    count = maxTries;

                    // Orden por creación
                    var indicesInvertidos = hilosIndex.Select((h, index) => new { h, index }).OrderByDescending(a => a.h.Creacion).Select(a => a.index).ToList();
                    var index = 0;
                    foreach (var idx in indicesInvertidos)
                    {
                        creacionIndex[idx] = index++;
                    }

                    // Orden por tendencia
                    indicesInvertidos = hilosIndex.Select((h, index) => new { h, index }).OrderByDescending(a => a.h.TrendIndex).Select(a => a.index).ToList();
                    index = 0;
                    foreach (var idx in indicesInvertidos)
                    {
                        trendIndex[idx] = index++;
                    }
                }
                catch (Exception e)
                {
                    count++;
                    logger.LogWarning($"Intento: {count}/{maxTries}");
                    logger.LogWarning(e.Message);
                }
            }
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

        public async Task ActualizarMensajesGlobales()
        {
            using var scope = services.CreateScope();
            var premiumService = scope.ServiceProvider.GetService<PremiumService>();
            mensajeGlobales = await premiumService.GetMensajesGlobalesActivosOrdenados();
        }

        public async Task ActualizarListaVPNs()
        {
            var intentos = 0;
            var intentosMax = 25;

            while (intentos < intentosMax)
            {
                try
                {
                    string result = await client.GetStringAsync("https://raw.githubusercontent.com/X4BNet/lists_vpn/main/ipv4.txt");
                    listaVPNs = Regex.Split(result, "\r\n|\r|\n").ToList();
                    //listaVPNs = Regex.Split("\n", "\r\n|\r|\n").ToList(); // Test
                    List<string> nuevasIpsNoSeguras = new List<string>();
                    foreach (var ip in ipsSeguras.Keys)
                    {
                        if (!String.IsNullOrEmpty(ip))
                        {
                            var ipParsed = IPAddressRange.Parse(ip);
                            foreach (var vpn in listaVPNs)
                            {
                                if (!String.IsNullOrEmpty(vpn))
                                {
                                    var range = IPAddressRange.Parse(vpn);
                                    if (range.Contains(ipParsed))
                                    {
                                        nuevasIpsNoSeguras.Add(ip);
                                    }
                                }
                            }
                        }
                    }

                    foreach (var ip in nuevasIpsNoSeguras)
                    {
                        ipsSeguras.Remove(ip, out bool jejeTaBien);
                    }
                    intentos = intentosMax;
                    logger.LogInformation("Lista de VPNs actualizada.");
                }
                catch (Exception e)
                {
                    intentos++;
                    logger.LogTrace(e, "ActualizarListaVPNs exception.");
                }
            }
        }

        public void Dispose()
        {
            timer?.Dispose();
            timer2?.Dispose();
        }
    }

    public class BanCache
    {
        public List<BaneoModel> BaneosActivos { get; set; } = new List<BaneoModel>();
        public HashSet<string> IpsBaneadas { get; set; }
        public HashSet<string> IdsBaneadas { get; set; }
    }
}
