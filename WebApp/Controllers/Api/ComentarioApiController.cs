using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore;
using Microsoft.Extensions.Logging;
using Servicios;
using System.Collections.Generic;
using Modelos;
using System.Threading.Tasks;
using System.Net;
using System;
using System.Text.RegularExpressions;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Data;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace WebApp.Controllers
{
    [ApiController, Route("api/Comentario/{action}")]
    public class ComentarioApiControlelr : ControllerBase
    {
        private readonly IHiloService hiloService;
        private readonly IComentarioService comentarioService;
        private readonly HtmlEncoder htmlEncoder;
        private readonly RChanContext context;
        private readonly HashService hashService;
        private readonly IMediaService mediaService;

        public ComentarioApiControlelr(
            IHiloService hiloService,
            IComentarioService comentarioService,
            IMediaService mediaService,
            HtmlEncoder htmlEncoder,
            RChanContext chanContext,
            HashService hashService
        )
        {
            this.hiloService = hiloService;
            this.comentarioService = comentarioService;
            this.htmlEncoder = htmlEncoder;
            this.context = chanContext;
            this.hashService = hashService;
            this.mediaService = mediaService;
        }

        [HttpPost, Authorize]
        public async Task<ActionResult<ApiResponse>> Crear([FromForm] ComentarioFormViewModel comentarioForm)
        {
            var hilo = await context.Hilos.FirstOrDefaultAsync(c => c.Id == comentarioForm.HiloId);
            if(hilo is null) return NotFound();

            var comentario = new ComentarioModel
            {
                UsuarioId = User.GetId(),
                HiloId = comentarioForm.HiloId,
                Contenido = comentarioForm.Contenido,
                Creacion = DateTimeOffset.Now
            };

            if(comentarioForm.Archivo is null) 
            {
            } else if (comentarioForm.Archivo.ContentType.Contains("image")) 
            {
                var media = await mediaService.GenerarDesdeImagen(comentarioForm.Archivo);
                comentario.Media = media;
                comentario.MediaId = media.Id;
            }

            var comentariosRespondidos = Regex.Matches(comentario.Contenido, @">>([A-Z0-9]{8})").Select( m => m.Groups[1].Value).ToList();

            var notisRespuestas = await context.Comentarios
                .Where(c => comentariosRespondidos.Contains(c.Id) && c.UsuarioId != comentario.UsuarioId)
                .Select(c => new NotificacionModel {
                    UsuarioId = c.UsuarioId,
                    HiloId = comentario.HiloId,
                    ComentarioId = c.Id,
                    Tipo = NotificacionType.Respuesta,
                    Actualizacion =  DateTimeOffset.Now
                }).ToListAsync();

                notisRespuestas.ForEach(n => {
                    n.Id = hashService.Random(20);
                });

            context.Notificaciones.AddRange(notisRespuestas);
            
            

            comentario.Contenido = RemplazarTagsPorLinks(comentario.Contenido);
            await comentarioService.Guardar(comentario);

            //Crear una notificacion para todos los que siguen el hilo
            //Necesito
            var nuevasNotis = await context.HiloAcciones
                .Where(a => a.HiloId == hilo.Id && a.UsuarioId != comentario.UsuarioId)
                .Select(a => new NotificacionModel {
                    UsuarioId = a.UsuarioId,
                    HiloId = comentario.HiloId,
                    ComentarioId = comentario.Id,
                    Tipo = NotificacionType.Comentario,
                    Actualizacion =  DateTimeOffset.Now
                }).ToListAsync();

            nuevasNotis = nuevasNotis.Select(n => {
                n.Id = hashService.Random();
                return n;
            }).ToList();
            
            // Crear Noficiacion para los comentarios tageados


            await context.Notificaciones.AddRangeAsync(nuevasNotis);
            await context.SaveChangesAsync();

            return new ApiResponse("Comentario creado!");
        }

        private string RemplazarTagsPorLinks(string contenido)
        {
            contenido = htmlEncoder.Encode(contenido);
            var resultado = Regex.Replace(contenido, @"&gt;&gt;([A-Z0-9]{8})", m => {
                var id = m.Groups[1].Value;
                return $"<a href=\"#{id}\" class=\"restag\" data-quote=\" {id}\">&gt;&gt; {id}</a>";
            });

            return Regex.Replace(contenido, @"&gt;&gt;([A-Z0-9]{8})", m => {
                var id = m.Groups[1].Value;
                return $"<a href=\"#{id}\" class=\"restag\" r-id=\" {id}\">&gt;&gt;{id}</a>";
            });
        }
    }


}
public class ComentarioFormViewModel {
    public string HiloId { get; set; }
    public string Contenido { get; set; }
    public IFormFile Archivo { get; set; }
}