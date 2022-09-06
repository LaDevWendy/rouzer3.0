using Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Modelos;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using SixLabors.ImageSharp.Processing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Xabe.FFmpeg;

namespace Servicios
{
    public interface IMediaService
    {
        string GetThumbnail(string id);
        Task<MediaModel> GenerarMediaDesdeArchivo(IFormFile archivo, bool esAdmin);
        Task<MediaModel> GenerarMediaDesdeLink(string url, bool esAdmin);
        Task<MediaModel> GenerarMediaDesdeStream(Stream archivoStream, string filename, string type, bool esAdmin);
        Task<bool> Eliminar(string id);
        Task<int> LimpiarMediasHuerfanos();
        Task<int> CalcularTotalSize();
        string[] FormatosSoportados { get; }
        Task GenerarMediasBot();
    }

    public class MediaService : IMediaService
    {
        protected string CarpetaDeAlmacenamiento { get; }

        public string[] FormatosSoportados => new[] { "jpeg", "jpg", "gif", "mp4", "webm", "png", "webp" };

        protected readonly RChanContext context;
        protected readonly IWebHostEnvironment env;
        protected readonly ILogger<MediaService> logger;
        protected readonly string[] exclude = { "youtu", "bitchute", "dailymotion", "dai.ly", "pornhub" };
        private readonly HttpClient client = new();

        public MediaService(string carpetaDeAlmacenamiento, RChanContext context, IWebHostEnvironment env, ILogger<MediaService> logger
)
        {
            this.CarpetaDeAlmacenamiento = carpetaDeAlmacenamiento;
            this.context = context;
            this.env = env;
            this.logger = logger;
        }

        public string GetThumbnail(string id)
        {
            var filenames = Directory
                .GetFileSystemEntries(Path.Join(CarpetaDeAlmacenamiento, "Thumbnails"))
                .Select(Path.GetFileName)
                .Select(e => $"/Thumbnails/{e}")
                .ToList();
            return Uri.EscapeUriString(filenames[new Random().Next(filenames.Count())]);
        }

        public virtual async Task<MediaModel> GenerarMediaDesdeArchivo(IFormFile archivo, bool esAdmin)
        {
            using var archivoStream = archivo.OpenReadStream();
            string filename = archivo.FileName;
            string type = archivo.ContentType;
            return await GenerarMediaDesdeStream(archivoStream, filename, type, esAdmin);
        }

        public virtual async Task<MediaModel> GenerarMediaDesdeStream(Stream archivoStream, string filename, string type, bool esAdmin)
        {
            bool esVideo = type.Contains("video");
            string fmt = type.Split("/")[1];

            Stream imagenStream;
            bool esImagen = !esVideo && (fmt != "gif");
            if (esImagen)
                imagenStream = archivoStream;
            else
                imagenStream = await GenerarImagenDesdeVideo(archivoStream, filename);

            // Genero un hash md5 del archivo
            archivoStream.Seek(0, SeekOrigin.Begin);
            var hash = archivoStream.GenerarHashAsync();
            // Me fijo si el hash existe en la db
            var mediaAntiguo = await context.Medias.FirstOrDefaultAsync(e => e.Id == hash);

            bool flag = false;
            if (mediaAntiguo != null)
            {
                if (esAdmin)
                {
                    if (!(mediaAntiguo.Tipo == MediaType.Eliminado))
                    {
                        return mediaAntiguo;
                    }
                    else
                    {
                        flag = true;
                    }
                }
                else
                {
                    return mediaAntiguo;
                }
            }

            // Si no se resetea el stream imageSharp deja de funcionar -_o_-
            imagenStream.Seek(0, SeekOrigin.Begin);
            archivoStream.Seek(0, SeekOrigin.Begin);

            using var original = await Image.LoadAsync(imagenStream);

            if (esImagen)
            {
                ExifProfile exif = original.Metadata.ExifProfile;
                if (exif != null)
                {
                    foreach (var value in exif.Values.ToList())
                    {
                        if (value.Tag.ToString() != "Orientation")
                        {
                            exif.RemoveValue(value.Tag);
                        }
                    }
                }
            }

            using var thumbnail = original.Clone(e => e.Resize(300, 0));
            using var cuadradito = thumbnail.Clone(e => e.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Crop,
                Position = AnchorPositionMode.Center,
                Size = new Size(300)
            }));

            MediaModel media = null;
            MediaPropiedadesModel mediaProps = null;
            if (flag)
            {
                media = mediaAntiguo;
                media.Tipo = esVideo ? MediaType.Video : MediaType.Imagen;
                media.Url = $"{hash}.{fmt}";
            }
            else
            {
                media = new MediaModel
                {
                    Id = hash,
                    Hash = hash,
                    Tipo = esVideo ? MediaType.Video : MediaType.Imagen,
                    Url = $"{hash}.{fmt}",
                };
                mediaProps = new MediaPropiedadesModel
                {
                    Id = hash,
                    Size = archivoStream.Length,
                    Media = media,
                    Height = original.Height,
                    Width = original.Width
                };
            }

            // Si no se resetea el stream guarda correctamente -_o_-
            imagenStream.Seek(0, SeekOrigin.Begin);
            archivoStream.Seek(0, SeekOrigin.Begin);

            // Guardo las imagenes (original y miniatura) en el sistema de archivos

            if (esImagen)
            {
                await original.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.Url}");
            }
            else
            {
                using var salida = File.Create($"{CarpetaDeAlmacenamiento}/{media.Url}");
                await archivoStream.CopyToAsync(salida);
            }
            await thumbnail.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaLocal}");
            await cuadradito.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaCuadradoLocal}");

            await imagenStream.DisposeAsync();
            await archivoStream.DisposeAsync();

            if (!flag)
            {
                context.Medias.Add(media);
                if (mediaProps != null)
                {
                    context.MediasPropiedades.Add(mediaProps);
                }
            }
            else
            {
                context.Medias.Update(media);
            }
            await context.SaveChangesAsync();
            return media;
        }
        public async Task<Stream> GenerarImagenDesdeVideo(Stream video, string filename)
        {
            //Guardo el archivo en una carpeta temporal
            var directoryTemporal = Path.Join(env.ContentRootPath, "Temp");
            Directory.CreateDirectory(directoryTemporal);

            var archivoPath = Path.Join(directoryTemporal, Guid.NewGuid().ToString() + Path.GetExtension(filename));

            video.Seek(0, SeekOrigin.Begin);
            var archivoGuardado = File.Create(archivoPath);
            await video.CopyToAsync(archivoGuardado);

            await archivoGuardado.DisposeAsync();

            var archivoSalidaThumbnail = Path.Join(directoryTemporal, Guid.NewGuid().ToString() + ".jpg");

            var conversion = await FFmpeg.Conversions.FromSnippet.Snapshot(archivoPath,
                    archivoSalidaThumbnail,
                    TimeSpan.FromSeconds(0));

            var result = await conversion.Start();

            var imgStream = new MemoryStream();

            var archivoTemporalImagen = File.OpenRead(archivoSalidaThumbnail);
            await archivoTemporalImagen.CopyToAsync(imgStream);

            await archivoTemporalImagen.DisposeAsync();
            File.Delete(archivoPath);
            File.Delete(archivoSalidaThumbnail);
            return imgStream;
        }

        public virtual async Task<MediaModel> GenerarMediaDesdeYouTube(string url, bool esAdmin)
        {
            var match = Regex.Match(url, @"(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,12})");
            if (!match.Success) return null;

            string id = match.Groups[1].Value;

            var mediaAntiguo = await context.Medias.FirstOrDefaultAsync(m => m.Id == id);

            bool flag = false;
            if (mediaAntiguo != null)
            {
                if (esAdmin)
                {
                    if (!(mediaAntiguo.Tipo == MediaType.Eliminado))
                    {
                        return mediaAntiguo;
                    }
                    else
                    {
                        flag = true;
                    }
                }
                else
                {
                    return mediaAntiguo;
                }
            }

            var vistaPrevia = await client.GetAsync($"https://img.youtube.com/vi/{id}/maxresdefault.jpg");

            if (!vistaPrevia.IsSuccessStatusCode)
            {
                vistaPrevia = await client.GetAsync($"https://img.youtube.com/vi/{id}/hqdefault.jpg");
            }

            if (!vistaPrevia.IsSuccessStatusCode) return null;


            MediaModel media = null;
            if (flag)
            {
                media = mediaAntiguo;
                media.Tipo = MediaType.Youtube;
                media.Url = url;
            }
            else
            {
                media = new MediaModel
                {
                    Id = id,
                    Hash = id,
                    Tipo = MediaType.Youtube,
                    Url = url
                };
            }

            using var thumbnail = await vistaPrevia.Content.ReadAsStreamAsync();

            using var cuadradito = (await Image.LoadAsync(thumbnail)).Clone(e => e.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Crop,
                Position = AnchorPositionMode.Center,
                Size = new Size(300)
            }));

            using var vistaPreviaSalida = File.Create($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaLocal}");
            thumbnail.Seek(0, SeekOrigin.Begin);

            await thumbnail.CopyToAsync(vistaPreviaSalida);
            await cuadradito.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaCuadradoLocal}");

            if (!flag)
            {
                await context.Medias.AddAsync(media);
            }
            else
            {
                context.Medias.Update(media);
            }
            await context.SaveChangesAsync();

            return media;
        }

        public virtual async Task<MediaModel> GenerarMediaDesdeBitchute(string url, bool esAdmin)
        {
            var match = Regex.Match(url, @"(?:bitchute\.com\/\S*(?:(?:\/e(?:mbed))?\/|video\?(?:\S*?&?v\=)))([a-zA-Z0-9_-]{6,12})");
            if (!match.Success) return null;
            string id = match.Groups[1].Value;
            string hashid = $"bc_{id}";

            var mediaAntiguo = await context.Medias.FirstOrDefaultAsync(m => m.Id == hashid);

            bool flag = false;
            if (mediaAntiguo != null)
            {
                if (esAdmin)
                {
                    if (!(mediaAntiguo.Tipo == MediaType.Eliminado))
                    {
                        return mediaAntiguo;
                    }
                    else
                    {
                        flag = true;
                    }
                }
                else
                {
                    return mediaAntiguo;
                }
            }
            var httpResponse = await client.GetAsync(url);
            if (!httpResponse.IsSuccessStatusCode) return null;

            string httpResponseBody = await httpResponse.Content.ReadAsStringAsync();
            match = Regex.Match(httpResponseBody, @"https://static-3.bitchute.com/live/cover_images/[a-zA-Z0-9]*/[a-zA-Z0-9]*_[0-9]*x[0-9]*.jpg");
            if (!match.Success) return null;

            string vistaPreviaUrl = match.Value;
            var vistaPrevia = await client.GetAsync(vistaPreviaUrl);
            if (!vistaPrevia.IsSuccessStatusCode) return null;

            MediaModel media = null;
            if (flag)
            {
                media = mediaAntiguo;
                media.Tipo = MediaType.Bitchute;
                media.Url = url;
            }
            else
            {
                media = new MediaModel
                {
                    Id = hashid,
                    Hash = hashid,
                    Tipo = MediaType.Bitchute,
                    Url = url
                };
            }

            using var thumbnail = await vistaPrevia.Content.ReadAsStreamAsync();

            using var cuadradito = (await Image.LoadAsync(thumbnail)).Clone(e => e.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Crop,
                Position = AnchorPositionMode.Center,
                Size = new Size(300)
            }));

            using var vistaPreviaSalida = File.Create($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaLocal}");
            thumbnail.Seek(0, SeekOrigin.Begin);

            await thumbnail.CopyToAsync(vistaPreviaSalida);
            await cuadradito.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaCuadradoLocal}");

            if (!flag)
            {
                await context.Medias.AddAsync(media);
            }
            else
            {
                context.Medias.Update(media);
            }
            await context.SaveChangesAsync();

            return media;
        }

        public virtual async Task<MediaModel> GenerarMediaDesdeDailyMotion(string url, bool esAdmin)
        {
            var match = Regex.Match(url, @"(?:(?:dailymotion\.com\/(?:embed\/)?video\/)|(?:dai\.ly\/))([a-zA-Z0-9_-]{6,12})");
            if (!match.Success) return null;
            string id = match.Groups[1].Value;
            string hashid = $"dm_{id}";

            var mediaAntiguo = await context.Medias.FirstOrDefaultAsync(m => m.Id == hashid);

            bool flag = false;
            if (mediaAntiguo != null)
            {
                if (esAdmin)
                {
                    if (!(mediaAntiguo.Tipo == MediaType.Eliminado))
                    {
                        return mediaAntiguo;
                    }
                    else
                    {
                        flag = true;
                    }
                }
                else
                {
                    return mediaAntiguo;
                }
            }

            var vistaPrevia = await client.GetAsync($"https://www.dailymotion.com/thumbnail/video/{id}");

            if (!vistaPrevia.IsSuccessStatusCode) return null;

            MediaModel media = null;
            if (flag)
            {
                media = mediaAntiguo;
                media.Tipo = MediaType.DailyMotion;
                media.Url = url;
            }
            else
            {
                media = new MediaModel
                {
                    Id = hashid,
                    Hash = hashid,
                    Tipo = MediaType.DailyMotion,
                    Url = url
                };
            }

            using var thumbnail = await vistaPrevia.Content.ReadAsStreamAsync();

            using var cuadradito = (await Image.LoadAsync(thumbnail)).Clone(e => e.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Crop,
                Position = AnchorPositionMode.Center,
                Size = new Size(300)
            }));

            using var vistaPreviaSalida = File.Create($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaLocal}");
            thumbnail.Seek(0, SeekOrigin.Begin);

            await thumbnail.CopyToAsync(vistaPreviaSalida);
            await cuadradito.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaCuadradoLocal}");

            if (!flag)
            {
                await context.Medias.AddAsync(media);
            }
            else
            {
                context.Medias.Update(media);
            }
            await context.SaveChangesAsync();

            return media;
        }
        public virtual async Task<MediaModel> GenerarMediaDesdePornHub(string url, bool esAdmin)
        {
            var match = Regex.Match(url, @"(?:pornhub.com\/(?:(?:view_video\.php\?viewkey=)|(?:embed\/)))([a-zA-Z0-9_-]{10,20})");
            if (!match.Success) return null;
            string id = match.Groups[1].Value;
            string hashid = $"ph_{id}";

            var mediaAntiguo = await context.Medias.FirstOrDefaultAsync(m => m.Id == hashid);

            bool flag = false;
            if (mediaAntiguo != null)
            {
                if (esAdmin)
                {
                    if (!(mediaAntiguo.Tipo == MediaType.Eliminado))
                    {
                        return mediaAntiguo;
                    }
                    else
                    {
                        flag = true;
                    }
                }
                else
                {
                    return mediaAntiguo;
                }
            }

            var httpResponse = await client.GetAsync($"https://pornhub.com/embed/{id}");
            if (!httpResponse.IsSuccessStatusCode) return null;

            string httpResponseBody = await httpResponse.Content.ReadAsStringAsync();
            match = Regex.Match(httpResponseBody, @"""image_url"":""(.*)"",""video_title""");
            if (!match.Success) return null;

            string vistaPreviaUrl = match.Groups[1].Value.Replace("\\", "");
            var vistaPrevia = await client.GetAsync(vistaPreviaUrl);
            if (!vistaPrevia.IsSuccessStatusCode) return null;

            MediaModel media = null;
            if (flag)
            {
                media = mediaAntiguo;
                media.Tipo = MediaType.PornHub;
                media.Url = url;
            }
            else
            {
                media = new MediaModel
                {
                    Id = hashid,
                    Hash = hashid,
                    Tipo = MediaType.PornHub,
                    Url = url
                };
            }
            using var thumbnail = await vistaPrevia.Content.ReadAsStreamAsync();

            using var cuadradito = (await Image.LoadAsync(thumbnail)).Clone(e => e.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Crop,
                Position = AnchorPositionMode.Center,
                Size = new Size(300)
            }));

            using var vistaPreviaSalida = File.Create($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaLocal}");
            thumbnail.Seek(0, SeekOrigin.Begin);

            await thumbnail.CopyToAsync(vistaPreviaSalida);
            await cuadradito.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaCuadradoLocal}");

            if (!flag)
            {
                await context.Medias.AddAsync(media);
            }
            else
            {
                context.Medias.Update(media);
            }
            await context.SaveChangesAsync();

            return media;
        }
        public virtual async Task<MediaModel> GenerarMediaDesdeLink(string url, bool esAdmin)
        {
            var match = Regex.Match(url, @"(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,12})");
            if (match.Success)
                return await GenerarMediaDesdeYouTube(url, esAdmin);
            match = Regex.Match(url, @"(?:bitchute\.com\/\S*(?:(?:\/e(?:mbed))?\/|video\?(?:\S*?&?v\=)))([a-zA-Z0-9_-]{6,12})");
            if (match.Success)
                return await GenerarMediaDesdeBitchute(url, esAdmin);
            match = Regex.Match(url, @"(?:(?:dailymotion\.com\/(?:embed\/)?video\/)|(?:dai\.ly\/))([a-zA-Z0-9_-]{6,12})");
            if (match.Success)
                return await GenerarMediaDesdeDailyMotion(url, esAdmin);
            match = Regex.Match(url, @"(?:pornhub.com\/(?:(?:view_video\.php\?viewkey=)|(?:embed\/)))([a-zA-Z0-9_-]{10,20})");
            if (match.Success)
                return await GenerarMediaDesdePornHub(url, esAdmin);
            return await GenerarMediaDesdeUrl(url, esAdmin);
        }

        public async Task<MediaModel> GenerarMediaDesdeUrl(string url, bool esAdmin)
        {
            // Obtener tamaño
            long size = MediaExtension.GetFileSize(url);

            // Si es mayor a 30mb se rechaza
            if (size < 0 || size > 31457280)
                throw new Exception("Archivo muy pesado.");

            //Obtener tipo
            string type = MediaExtension.GetContentType(url);

            //Si no es un tipo soportado se rechaza
            if (!FormatosSoportados.Contains(type.Split("/")[1]))
                throw new Exception("El  formato del archivo no es soportado.");

            // Crear un nombre único para evitar concurrencias
            string filename = $"{Guid.NewGuid()}.{type.Split("/")[1].ToLower()}";

            // Leer el archivo remoto
            WebClient client = new WebClient();
            client.Headers["User-Agent"] = "Rouzer/2.2.0 (https://rouzer.fun/; RouzedFoster4000@yahoo.com) generic-library/2.2.0";
            using Stream data = await client.OpenReadTaskAsync(new Uri(url));

            // Guardo el archivo en una carpeta temporal (no se puede usar método seek si no)
            var directoryTemporal = Path.Join(env.ContentRootPath, "Temp");
            Directory.CreateDirectory(directoryTemporal);
            var archivoPath = Path.Join(directoryTemporal, filename);
            var archivoGuardado = File.Create(archivoPath);
            await data.CopyToAsync(archivoGuardado);
            await archivoGuardado.DisposeAsync();

            // Lectura y conversión a MediaModel
            using Stream stream = File.Open(archivoPath, FileMode.Open);
            MediaModel media = null;
            try
            {
                media = await GenerarMediaDesdeStream(stream, filename, type, esAdmin);
            }
            catch (Exception)
            {
                // Borrado archivo temporal
                await stream.DisposeAsync();
                File.Delete(archivoPath);
                throw;
            }

            // Borrado archivo temporal
            await stream.DisposeAsync();
            File.Delete(archivoPath);

            return media;
        }

        public virtual async Task<bool> Eliminar(string id)
        {
            var media = await context.Medias.FirstOrDefaultAsync(m => m.Id == id);
            if (media is null)
            {
                return false;
            }
            if (media.Tipo == MediaType.Eliminado)
            {
                return false;
            }
            var archivosAEliminar = new List<string>(new[]{
                $"{CarpetaDeAlmacenamiento}/{media.VistaPreviaCuadradoLocal}",
                $"{CarpetaDeAlmacenamiento}/{media.VistaPreviaLocal}",
                $"{CarpetaDeAlmacenamiento}/{media.Url}",
            });
            media.Tipo = MediaType.Eliminado;
            media.Url = "";
            await context.SaveChangesAsync();
            while (archivosAEliminar.Count != 0)
            {
                try
                {
                    if (exclude.Aggregate(false, (acc, word) => acc || archivosAEliminar.First().Contains(word)))
                    {

                    }
                    else
                    {
                        File.Delete(archivosAEliminar.First());
                    }
                    archivosAEliminar.Remove(archivosAEliminar.First());
                }
                catch (Exception)
                {
                    logger.LogError($"No se ha podido eliminar el archivo {archivosAEliminar.First()}");
                    await Task.Delay(100);
                }
            }
            return true;
        }

        public async Task<int> LimpiarMediasHuerfanos()
        {
            var mediasABorrar = await context.Medias
                .Where(m => !context.Hilos.Any(h => h.MediaId == m.Id) && !context.Comentarios.Any(c => c.MediaId == m.Id))
                .Where(m => m.Tipo != MediaType.Eliminado)
                .Where(m => m.Id != "Ruleta_Media_Id")
                .Where(m => m.Id != "No_Existe_Id")
                .ToListAsync();

            logger.LogInformation($"Limpiando medias viejos {mediasABorrar.Count}");

            // var eliminados = 0;
            var eliminados = new List<MediaModel>();
            foreach (var m in mediasABorrar)
            {

                await Eliminar(m.Id);
                eliminados.Add(m);
            }
            context.RemoveRange(eliminados);
            var n = await context.SaveChangesAsync();
            logger.LogInformation($"${n} archivos multimedia eliminados");
            return n;
        }

        protected bool EsFormatoValido(string contentType)
        {
            return Regex.IsMatch(contentType, @"(jpeg|png|gif|jpg|mp4|webm)");
        }

        public async Task<int> CalcularTotalSize()
        {
            var medias = await context.Medias.AsNoTracking().Where(m => m.Tipo == MediaType.Imagen || m.Tipo == MediaType.Video).ToListAsync();
            var mediasProps = await context.MediasPropiedades.AsNoTracking().ToListAsync();
            foreach (var m in medias)
            {
                if (!(mediasProps.Any(mp => mp.Id == m.Id)))
                {
                    using var original = File.Open($"{CarpetaDeAlmacenamiento}/{m.Url}", FileMode.Open);
                    var mp = new MediaPropiedadesModel
                    {
                        Id = m.Id,
                        Size = original.Length,
                        MediaId = m.Id
                    };

                    if (m.Tipo == MediaType.Video)
                    {
                        try
                        {
                            using var thumbnail = File.Open($"{CarpetaDeAlmacenamiento}/{m.VistaPreviaLocal}", FileMode.Open);
                            using var imagen = await Image.LoadAsync(thumbnail);
                            mp.Height = imagen.Height;
                            mp.Width = imagen.Width;
                        }
                        catch (Exception)
                        {
                            logger.LogError($"Faltan dimensiones del archivo {m.Url}");
                            mp.Height = -1;
                            mp.Width = -1;
                        }
                    }
                    else
                    {
                        try
                        {
                            using var imagen = await Image.LoadAsync(original);
                            mp.Height = imagen.Height;
                            mp.Width = imagen.Width;
                        }
                        catch (Exception)
                        {
                            logger.LogError($"Faltan dimensiones del archivo {m.Url}");
                            mp.Height = -1;
                            mp.Width = -1;
                        }
                    }
                    context.MediasPropiedades.Add(mp);
                }
            }
            return await context.SaveChangesAsync();
        }

        public async Task GenerarMediasBot()
        {
            var media = await context.Medias.FirstOrDefaultAsync(m => m.Id == "Ruleta_Media_Id");
            if (media is null)
            {
                using var archivoStream = File.Open($"wwwroot/imagenes/ruleta.png", FileMode.Open);
                archivoStream.Seek(0, SeekOrigin.Begin);
                using var original = await Image.LoadAsync(archivoStream);
                using var thumbnail = original.Clone(e => e.Resize(300, 0));
                using var cuadradito = thumbnail.Clone(e => e.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Crop,
                    Position = AnchorPositionMode.Center,
                    Size = new Size(300)
                }));
                media = new MediaModel
                {
                    Id = "Ruleta_Media_Id",
                    Hash = "Ruleta_Media_Id",
                    Tipo = MediaType.Imagen,
                    Url = "Ruleta_Media_Id.png",
                };
                var mediaProps = new MediaPropiedadesModel
                {
                    Id = media.Id,
                    Size = archivoStream.Length,
                    Media = media,
                    Height = original.Height,
                    Width = original.Width
                };

                archivoStream.Seek(0, SeekOrigin.Begin);
                await original.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.Url}");
                await thumbnail.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaLocal}");
                await cuadradito.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaCuadradoLocal}");
                await archivoStream.DisposeAsync();
                context.MediasPropiedades.Add(mediaProps);
                await context.SaveChangesAsync();
            }

            media = await context.Medias.FirstOrDefaultAsync(m => m.Id == "No_Existe_Id");
            if (media is null)
            {
                using var archivoStream = File.Open($"wwwroot/imagenes/noexiste.png", FileMode.Open);
                archivoStream.Seek(0, SeekOrigin.Begin);
                using var original = await Image.LoadAsync(archivoStream);
                using var thumbnail = original.Clone(e => e.Resize(300, 0));
                using var cuadradito = thumbnail.Clone(e => e.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Crop,
                    Position = AnchorPositionMode.Center,
                    Size = new Size(300)
                }));
                media = new MediaModel
                {
                    Id = "No_Existe_Id",
                    Hash = "No_Existe_Id",
                    Tipo = MediaType.Imagen,
                    Url = "No_Existe_Id.png",
                };
                var mediaProps = new MediaPropiedadesModel
                {
                    Id = media.Id,
                    Size = archivoStream.Length,
                    Media = media,
                    Height = original.Height,
                    Width = original.Width
                };

                archivoStream.Seek(0, SeekOrigin.Begin);
                await original.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.Url}");
                await thumbnail.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaLocal}");
                await cuadradito.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaCuadradoLocal}");
                await archivoStream.DisposeAsync();
                context.MediasPropiedades.Add(mediaProps);
                await context.SaveChangesAsync();
            }
        }
    }
}

static class MediaExtension
{
    public static string GenerarHashAsync(this Stream archivo)
    {
        using var md5 = MD5.Create();
        var hash = md5.ComputeHash(archivo);
        return string.Join("", hash.Select(e => e.ToString("x2")));
    }

    public static string GetContentType(string url)
    {
        string result = "";
        HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
        req.UserAgent = "Rouzer/2.2.0 (https://rouzer.fun/; RouzedFoster4000@yahoo.com) generic-library/2.2.0";
        req.Method = "HEAD";
        using (System.Net.WebResponse resp = req.GetResponse())
        {

            result = resp.Headers.Get("Content-Type");
        }
        return result;
    }

    public static long GetFileSize(string url)
    {
        long result = -1;
        HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
        req.Method = "HEAD";
        req.UserAgent = "Rouzer/2.2.0 (https://rouzer.fun/; RouzedFoster4000@yahoo.com) generic-library/2.2.0";
        using (System.Net.WebResponse resp = req.GetResponse())
        {
            if (long.TryParse(resp.Headers.Get("Content-Length"), out long ContentLength))
            {
                result = ContentLength;
            }
        }

        return result;
    }

}
