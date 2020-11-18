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
        private readonly NotificacioensService notificacioensService;
        private readonly AntiFloodService antiFlood;
        private readonly IMediaService mediaService;

        public ComentarioApiControlelr(
            IHiloService hiloService,
            IComentarioService comentarioService,
            IMediaService mediaService,
            HtmlEncoder htmlEncoder,
            RChanContext chanContext,
            HashService hashService,
            IHubContext<RChanHub> rchanHub,
            NotificacioensService notificacioensService,
            AntiFloodService antiFlood
        )
        {
            this.hiloService = hiloService;
            this.comentarioService = comentarioService;
            this.htmlEncoder = htmlEncoder;
            this.context = chanContext;
            this.hashService = hashService;
            this.rchanHub = rchanHub;
            this.notificacioensService = notificacioensService;
            this.antiFlood = antiFlood;
            this.mediaService = mediaService;
        }

        [HttpPost, Authorize]
        public async Task<ActionResult<ApiResponse>> Crear([FromForm] ComentarioFormViewModel vm)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var hilo = await context.Hilos.FirstOrDefaultAsync(c => c.Id == vm.HiloId);
            if(hilo is null) return NotFound();

            if(antiFlood.SegundosParaComentar(User)  != new TimeSpan(0))
            {
                ModelState.AddModelError("Para para", $"faltan {antiFlood.SegundosParaComentar(User).Seconds} para que pudeas comentar");
                return BadRequest(ModelState);
            }else {
                antiFlood.HaComentado(User.GetId());
            }

            var ip = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();

            var comentario = new ComentarioModel
            {
                UsuarioId = User.GetId(),
                HiloId = vm.HiloId,
                Contenido = vm.Contenido,
                Creacion = DateTimeOffset.Now,
                Ip = ip,
            };

            MediaModel media = null;
            if(vm.Archivo != null) 
            {
                 if(!new []{"jpeg", "jpg", "gif", "mp4", "webm", "png"}.Contains(vm.Archivo.ContentType.Split("/")[1]))
                {
                    ModelState.AddModelError("El Archivo no es soportado", "");
                    return BadRequest(ModelState);
                }
                    media = await mediaService.GenerarMediaDesdeArchivo(vm.Archivo);
            } else  if (!string.IsNullOrWhiteSpace(vm.Link))
            {
                media = await mediaService.GenerarMediaDesdeLink(vm.Link);
            }
            if(media != null)
            {
                    comentario.Media = media;
                    comentario.MediaId = media.Id;
            }

            await comentarioService.Guardar(comentario);


            ComentarioViewModel model = new ComentarioViewModel(comentario);
            model.EsOp = hilo.UsuarioId == User.GetId();

             await rchanHub.Clients.Group(comentario.HiloId).SendAsync("NuevoComentario", model);
             await rchanHub.Clients.Group("home").SendAsync("HiloComentado", hilo.Id, comentario.Contenido);
            
            await notificacioensService.NotificarRespuestaAHilo(hilo, comentario);
            await notificacioensService.NotificarRespuestaAComentarios(hilo, comentario);

            await context.SaveChangesAsync();
            return new ApiResponse("Comentario creado!");
        }

    }
}
public class ComentarioFormViewModel {
    [Required]
    public string HiloId { get; set; }
    [Required(ErrorMessage="El comentario no puede estar vacio padre")]
    public string Contenido { get; set; }
    public IFormFile Archivo { get; set; }
    public string Link { get; set; }
}
