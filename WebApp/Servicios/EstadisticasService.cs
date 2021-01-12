using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Ganss.XSS;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Modelos;
using WebApp;

namespace Servicios
{
    public class EstadisticasService
    {
        private static Estadisticas estadisticas;
        private readonly string ubicacionDeArchivo;
        private readonly IHubContext<RChanHub> rchanHub;

        public EstadisticasService(string ubicacionDeArchivo, IHubContext<RChanHub> rchanHub)
        {
            this.ubicacionDeArchivo = ubicacionDeArchivo;
            this.rchanHub = rchanHub;
        }

        public async Task Guardar()
        {
            await File.WriteAllTextAsync(ubicacionDeArchivo, JsonSerializer.Serialize(estadisticas,
                new JsonSerializerOptions
                {
                    WriteIndented = true,
                })
            );
        }

        public async Task<Estadisticas> GetEstadisticasAsync()
        {
            if (estadisticas is null)
            {
                estadisticas = JsonSerializer.Deserialize<Estadisticas>(await File.ReadAllTextAsync(ubicacionDeArchivo));
            }
            estadisticas.ComputadorasConectadas = RChanHub.NumeroDeUsuariosConectados;
            return estadisticas;
        }

        public async Task RegistrarNuevoHilo()
        {
            estadisticas.HilosCreados++;
            await rchanHub.Clients.Group("rozed").SendAsync("estadisticasActualizadas", estadisticas);
            await Guardar();
        }

        public async Task RegistrarNuevoComentario()
        {
            estadisticas.ComentariosCreados++;
            await rchanHub.Clients.Group("rozed").SendAsync("estadisticasActualizadas", estadisticas);
            await Guardar();
        }

        public async Task Inicializar(Estadisticas estadisticas)
        {
            if (!File.Exists(ubicacionDeArchivo))
            {
                await File.WriteAllTextAsync(ubicacionDeArchivo, JsonSerializer.Serialize(estadisticas,
                    new JsonSerializerOptions { WriteIndented = true })
                );
            }
        }
    }
}