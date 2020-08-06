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
using System.ComponentModel.DataAnnotations;


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
            if(!ModelState.IsValid) return BadRequest(ModelState);
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
/////////////////////////////
            var comentariosRespondidos = Regex.Matches(comentario.Contenido, @">>([A-Z0-9]{8})")
                .Select( m => m.Groups[1].Value)
                .Where(id => id != User.GetId())
                .Distinct() 
                .ToList();

            comentario.Contenido = RemplazarTagsPorLinks(comentario.Contenido);
            await comentarioService.Guardar(comentario);
            
            var users = await context.Comentarios
                .Where( c => comentariosRespondidos.Contains(c.Id) && c.UsuarioId != User.GetId())
                .ToDictionaryAsync(c => c.Id);
            
            var notisViejas = await context.Notificaciones
                .Where(n => n.Tipo == NotificacionType.Respuesta &&
                            comentariosRespondidos.Contains(n.ComentarioId))
                .ToListAsync();

            foreach (var noti in notisViejas)
            {
                comentariosRespondidos.Remove(noti.ComentarioId);
                noti.Conteo++;
                noti.Actualizacion = DateTimeOffset.Now;
            }
            var nuevasNotisR = comentariosRespondidos
            .Where(c => users.Keys.Contains(c))
            .Select( c =>
            {
                NotificacionModel notificacionModel1 = new NotificacionModel
                {
                    UsuarioId = users[c].UsuarioId,
                    HiloId = comentario.HiloId,
                    ComentarioId = c,
                    Tipo = NotificacionType.Respuesta,
                    Conteo = 1,
                    Actualizacion = DateTimeOffset.Now,
                    Id = hashService.Random(),
                };
                NotificacionModel notificacionModel = notificacionModel1;
                return notificacionModel;
            }).ToList();
            context.Notificaciones.AddRange(nuevasNotisR);
            await context.SaveChangesAsync();


            
///////////////////
            var seguidoresDeHilo = await context.HiloAcciones
                .Where(ha => ha.HiloId == comentario.HiloId && ha.Seguido && ha.UsuarioId != User.GetId())
                .Select(ha => context.Usuarios.FirstOrDefault(u => u.Id == ha.UsuarioId))
                .Where(u => u != null)
                .ToListAsync();
            
            notisViejas = await context.Notificaciones
                .Where(n => n.Tipo == NotificacionType.Comentario &&
                            n.HiloId == comentario.HiloId &&
                            seguidoresDeHilo.Select(s => s.Id).Contains(n.UsuarioId))
                .ToListAsync();

            foreach (var noti in notisViejas)
            {
                seguidoresDeHilo.RemoveAll( s => s.Id == noti.UsuarioId);
                noti.Conteo++;
                noti.Actualizacion = DateTimeOffset.Now;
            }
            nuevasNotisR = seguidoresDeHilo.Select( s => new NotificacionModel {
                        UsuarioId = s.Id,
                        HiloId = comentario.HiloId,
                        ComentarioId = comentario.Id,
                        Tipo = NotificacionType.Comentario,
                        Conteo = 1,
                        Actualizacion =  DateTimeOffset.Now,
                        Id = hashService.Random(),
            }).ToList();

            context.Notificaciones.AddRange(nuevasNotisR);
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
    [Required]
    public string HiloId { get; set; }
    [Required(ErrorMessage="El comentario no puede estar vacio padre")]
    public string Contenido { get; set; }
    public IFormFile Archivo { get; set; }
}