using Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Modelos;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Servicios
{
    public interface IAudioService
    {
        Task<AudioModel> GenerarAudio(IFormFile audio);
        Task<bool> Eliminar(string id);
        Task<int> LimpiarAudiosHuerfanos();
    }
    public class AudioService : IAudioService
    {
        protected string CarpetaDeAlmacenamiento { get; }
        protected readonly RChanContext context;
        protected readonly ILogger<AudioService> logger;

        public AudioService(string carpetaDeAlmacenamiento, RChanContext context, ILogger<AudioService> logger
)
        {
            this.CarpetaDeAlmacenamiento = carpetaDeAlmacenamiento;
            this.context = context;
            this.logger = logger;
        }

        public async Task<AudioModel> GenerarAudio(IFormFile audio)
        {
            AudioModel audioModel = new AudioModel();
            audioModel.Id = Guid.NewGuid().ToString();
            audioModel.Url = audioModel.Id + ".webm";
            using var salida = File.Create($"{CarpetaDeAlmacenamiento}/{audioModel.Url}");
            await audio.CopyToAsync(salida);
            await context.AddAsync(audioModel);
            return audioModel;
        }

        public async Task<bool> Eliminar(string id)
        {
            var audio = await context.Audios.FirstOrDefaultAsync(a => a.Id == id);
            if (audio is null)
            {
                return false;
            }
            int intentos = 25;
            bool eliminado = false;
            while (!eliminado && intentos > 0)
                try
                {
                    File.Delete($"{CarpetaDeAlmacenamiento}/{audio.Url}");
                    context.Remove(audio);
                    await context.SaveChangesAsync();
                    eliminado = true;
                }
                catch (Exception e)
                {
                    intentos--;
                    await Task.Delay(100);
                }
            if (!eliminado)
            {
                logger.LogError($"No se pudo eliminar el audio id: {audio.Id}.");
            }
            return eliminado;
        }
        public async Task<int> LimpiarAudiosHuerfanos()
        {
            var audiosABorrar = await context.Audios.Where(a => !context.Hilos.Any(h => h.AudioId == a.Id) && !context.Comentarios.Any(c => c.AudioId == a.Id)).ToListAsync();

            logger.LogInformation($"Limpiando audios viejos {audiosABorrar.Count()}");

            var eliminados = 0;
            foreach (var a in audiosABorrar)
            {
                try
                {
                    await Eliminar(a.Id);
                    eliminados++;
                }
                catch (Exception e)
                {
                    logger.LogError($"No se pudieron eliminar todos los audios.");
                    logger.LogError(e.Message);
                    logger.LogError(e.StackTrace);
                }
            }
            logger.LogInformation($"${eliminados} archivos de audio eliminados.");
            return eliminados;
        }
    }

}
