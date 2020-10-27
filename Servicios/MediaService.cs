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
using FFMpegCore;
using System.Drawing.Imaging;

namespace Servicios
{
    public interface IMediaService
    {
        string GetThumbnail(string id);
        Task<MediaModel> GenerarMediaDesdeArchivo(IFormFile archivo);
    }

    public class MediaService : IMediaService
    {
        private string CarpetaDeAlmacenamiento { get; }
        private readonly RChanContext context;

        public MediaService(string carpetaDeAlmacenamiento, RChanContext context)
        {
            this.CarpetaDeAlmacenamiento = carpetaDeAlmacenamiento;
            this.context = context;
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

        public async Task<MediaModel> GenerarMediaDesdeArchivo(IFormFile archivo)
        {
            bool esVideo = archivo.ContentType.Contains("video");

            using var archivoStream = archivo.OpenReadStream();

            Stream imagenStream;

            if(!esVideo)
                imagenStream = archivoStream;
            else
                imagenStream = await GenerarImagenDesdeVideo(archivoStream, archivo.FileName);

            // Genero un hash md5 del archivo
            archivoStream.Seek(0, SeekOrigin.Begin);
            var hash = await archivoStream.GenerarHashAsync();
            // Me fijo si el hash existe en la db
            var mediaAntiguo = await context.Medias.FirstOrDefaultAsync(e => e.Id == hash);

            if(mediaAntiguo != null) return mediaAntiguo;

            // Si no se resetea el stream imageSharp deja de funcionar -_o_-
            imagenStream.Seek(0, SeekOrigin.Begin);
            archivoStream.Seek(0, SeekOrigin.Begin);

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
                Tipo = esVideo? MediaType.Video: MediaType.Imagen,
                Url = $"{hash}{Path.GetExtension(archivo.FileName)}",
            };

            // Si no se resetea el stream guarda correctamente -_o_-
            imagenStream.Seek(0, SeekOrigin.Begin);
            archivoStream.Seek(0, SeekOrigin.Begin);

            // Guardo las imagenes (original y miniatura) en el sistema de archivos
            using var salida = File.Create($"{CarpetaDeAlmacenamiento}/{media.Url}");
            await archivoStream.CopyToAsync(salida);
            await thumbnail.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.VistaPrevia}");
            await cuadradito.SaveAsync($"{CarpetaDeAlmacenamiento}/{media.VistaPreviaCuadrado}");

            await imagenStream.DisposeAsync();
            await archivoStream.DisposeAsync();

            await context.Medias.AddAsync(media);

            return media;
        }
        public async Task<Stream> GenerarImagenDesdeVideo(Stream video, string filename)
        {
            var archivoPath = "./" + Guid.NewGuid().ToString() + filename;
            video.Seek(0, SeekOrigin.Begin);
            var ar = File.Create(archivoPath);
            await video.CopyToAsync(ar);
            await ar.DisposeAsync();
            var vidInfo = await FFProbe.AnalyseAsync(archivoPath);

            var width = vidInfo.PrimaryVideoStream.Width;
            var height = vidInfo.PrimaryVideoStream.Height;

            var bitmap = await FFMpeg.SnapshotAsync(vidInfo, new System.Drawing.Size(width, height), TimeSpan.FromMinutes(0));

            var imgStream = new MemoryStream();
            bitmap.Save(imgStream, ImageFormat.Jpeg);
            File.Delete(archivoPath);
            
            return imgStream;


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