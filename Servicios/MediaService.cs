using System;
using System.Linq;
using System.IO;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Modelos;
using Data;
using Microsoft.AspNetCore.Http;
using System.Security.Cryptography;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace Servicios
{
    public interface IMediaService
    {
        string GetThumbnail(string id);
        Task<MediaModel> GenerarDesdeImagen(IFormFile imagen, bool esHilo = false);
    }

    public class MediaService : IMediaService
    {
        private string carpetaDeAlmacenamiento { get; }
        private RChanContext context;

        public MediaService(string carpetaDeAlmacenamiento, RChanContext context)
        {
            this.carpetaDeAlmacenamiento = carpetaDeAlmacenamiento;
            this.context = context;
        }

        public string GetThumbnail(string id)
        {
            var filenames = Directory
                .GetFileSystemEntries(Path.Join(carpetaDeAlmacenamiento, "Thumbnails"))
                .Select(Path.GetFileName)
                .Select(e => $"/Thumbnails/{e}")
                .ToList();
            return Uri.EscapeUriString(filenames[new Random().Next(filenames.Count())]);
        }

        public async Task<MediaModel> GenerarDesdeImagen(IFormFile imagen, bool esHilo = false)
        {
            using var imagenStream = imagen.OpenReadStream();
            // Genero un hash md5 del archivo
            var hash = await imagenStream.GenerarHashAsync();
            // Me fijo si el hash existe en la db
            var mediaAntiguo = await context.Medias.FirstOrDefaultAsync(e => e.Id == hash);

            if(mediaAntiguo != null) return mediaAntiguo;

            // Si no se resetea el stream imageSharp deja de funcionar -_o_-
            imagenStream.Seek(0, SeekOrigin.Begin);

            using var original = await Image.LoadAsync(imagenStream);
            using var thumbnail = original.Clone(e => e.Resize(300, 0));
            using var cuadradito = thumbnail.Clone(e => e.Resize( new ResizeOptions {
                Mode=ResizeMode.Crop,
                Position = AnchorPositionMode.Center,
                Size = new Size(300)
            }));

            var media = new MediaModel
            {
                Id = hash,
                Hash = hash,
                Tipo = MediaType.Imagen,
                Url = $"{hash}{Path.GetExtension(imagen.FileName)}",
            };

            // Si no se resetea el stream guarda correctamente -_o_-
            imagenStream.Seek(0, SeekOrigin.Begin);

            // Guardo las imagenes (original y miniatura) en el sistema de archivos
            using var salida = File.Create($"{carpetaDeAlmacenamiento}/{media.Url}");
            await imagenStream.CopyToAsync(salida);
            await thumbnail.SaveAsync($"{carpetaDeAlmacenamiento}/{media.VistaPrevia}");
            await cuadradito.SaveAsync($"{carpetaDeAlmacenamiento}/{media.VistaPreviaCuadrado}");

            await context.Medias.AddAsync(media);

            return media;
        }
    }
}

static class MediaExtension {
     public static async Task<string> GenerarHashAsync(this Stream archivo) {
            using var md5 = MD5.Create();
            var hash =  md5.ComputeHash(archivo);
            return string
                .Join("",hash.Select(e => e.ToString("x2")));
        }
}