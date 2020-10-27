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
using Microsoft.AspNetCore.SignalR;
using WebApp.Otros;

namespace WebApp.Controllers
{
    [ApiController, Route("api/Comentario/{action}")]
    public class ComentarioApiControlelr : Controller
    {
        private readonly IHiloService hiloService;
        private readonly IComentarioService comentarioService;
        private readonly HtmlEncoder htmlEncoder;
        private readonly RChanContext context;
        private readonly HashService hashService;
        private readonly IHubContext<RChanHub> rchanHub;
        private readonly IMediaService mediaService;

        public ComentarioApiControlelr(
            IHiloService hiloService,
            IComentarioService comentarioService,
            IMediaService mediaService,
            HtmlEncoder htmlEncoder,
            RChanContext chanContext,
            HashService hashService,
            IHubContext<RChanHub> rchanHub
        )
        {
            this.hiloService = hiloService;
            this.comentarioService = comentarioService;
            this.htmlEncoder = htmlEncoder;
            this.context = chanContext;
            this.hashService = hashService;
            this.rchanHub = rchanHub;
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
                var media = await mediaService.GenerarMediaDesdeArchivo(comentarioForm.Archivo);
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


            ComentarioViewModel model = new ComentarioViewModel(comentario);
            model.EsOp = hilo.UsuarioId == User.GetId();
            //var html = await this.RenderViewAsync("_ComentarioPartial", model, true);
            // await rchanHub.Clients.Group(comentario.HiloId).SendAsync("NuevoComentario", html);

             await rchanHub.Clients.Group(comentario.HiloId).SendAsync("NuevoComentario", model);
             await rchanHub.Clients.Group("home").SendAsync("HiloComentado", hilo.Id, comentario.Contenido);
            
            (await context.Comentarios
                .Where( c => comentariosRespondidos.Contains(c.Id) && c.UsuarioId != User.GetId())
                .Select(c => context.Usuarios.FirstOrDefault(u => u.Id == c.UsuarioId))
                .Where(u => u != null)
                .Select(s => new {Noti = context.Notificaciones.FirstOrDefault(n => n.UsuarioId == s.Id && n.HiloId == comentario.HiloId && n.Tipo == NotificacionType.Respuesta), s.Id})
                .ToListAsync())
                .ForEach(n => {
                    if(n.Noti is null) 
                    context.Notificaciones.Add(new NotificacionModel(hashService.Random(), n.Id, comentario, NotificacionType.Respuesta));
                    else 
                    {
                        n.Noti.Conteo++;
                        n.Noti.Actualizacion = DateTimeOffset.Now;
                    }
                });

            (await context.HiloAcciones
                .Where(ha => ha.HiloId == comentario.HiloId && ha.Seguido && ha.UsuarioId != User.GetId())
                .Select(ha => context.Usuarios.FirstOrDefault(u => u.Id == ha.UsuarioId))
                .Where(u => u != null)
                .Select(s => new {Noti = context.Notificaciones.FirstOrDefault(n => n.UsuarioId == s.Id && n.HiloId == comentario.HiloId && n.Tipo == NotificacionType.Comentario), s.Id})
                .ToListAsync())
                .ForEach(n => {
                    if(n.Noti is null) 
                    context.Notificaciones.Add(new NotificacionModel(hashService.Random(), n.Id, comentario));
                    else 
                    {
                        n.Noti.Conteo++;
                        n.Noti.Actualizacion = DateTimeOffset.Now;
                    }
                });

            await context.SaveChangesAsync();
            return new ApiResponse("Comentario creado!");
        }

        private string RemplazarTagsPorLinks(string contenido)
        {
            return string.Join("\n", contenido.Split("\n").Select(t => {
                t = htmlEncoder.Encode(t);
                var esLink = false;
                //Links
                t = Regex.Replace(t, @"&gt;(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)", m => {
                    var link = m.Value.Replace("&gt;", "");
                    esLink = true;
                    return $@"<a href=""{link}"" target=""_blank"">&gt{link}</a>";
                });
                if(esLink) return t;
                //Respuestas
                t =  Regex.Replace(t, @"&gt;&gt;([A-Z0-9]{8})", m => {
                    var id = m.Groups[1].Value;
                    return $"<a href=\"#{id}\" class=\"restag\" r-id=\" {id}\">&gt;&gt;{id}</a>";
                });

                //Texto verde
                t = Regex.Replace(t.Replace("&#xA;", "\n"),@"&gt;(?!https?).+(?:$|\n)", m => {
                    if(m.Value.Contains("&gt;&gt;") || m.Value.Contains("href")) return m.Value;
                    var text = m.Value.Replace("&gt;", "");
                    return $@"<span class=""verde"">&gt;{text}</span>";
                });
                return t;
            }));
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
