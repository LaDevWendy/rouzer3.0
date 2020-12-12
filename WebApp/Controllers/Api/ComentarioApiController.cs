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
        private readonly IComentarioService comentarioService;
        private readonly RChanContext context;
        private readonly IHubContext<RChanHub> rchanHub;
        private readonly NotificacioensService notificacioensService;
        private readonly AntiFloodService antiFlood;
        private readonly IMediaService mediaService;

        public ComentarioApiControlelr(
            IComentarioService comentarioService,
            IMediaService mediaService,
            RChanContext chanContext,
            IHubContext<RChanHub> rchanHub,
            NotificacioensService notificacioensService,
            AntiFloodService antiFlood
        )
        {
            this.comentarioService = comentarioService;
            this.context = chanContext;
            this.rchanHub = rchanHub;
            this.notificacioensService = notificacioensService;
            this.antiFlood = antiFlood;
            this.mediaService = mediaService;
        }

        [HttpPost, Authorize, ValidateAntiForgeryToken]
        public async Task<ActionResult<ApiResponse>> Crear([FromForm] ComentarioFormViewModel vm)
        {
            if(vm.Contenido is null) vm.Contenido = "";
            if(string.IsNullOrWhiteSpace(vm.Contenido) && vm.Archivo is null && string.IsNullOrWhiteSpace(vm.Link))
                ModelState.AddModelError("uy!", "El comentario no puede estar vacio padre");
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var hilo = await context.Hilos.FirstOrDefaultAsync(c => c.Id == vm.HiloId);
            if(hilo is null) return NotFound();

            if(hilo.Estado != HiloEstado.Normal) 
            {
                ModelState.AddModelError("Jeje", "Este roz no esta activo");
                return BadRequest(ModelState);
            }

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
            try
            {
                if(vm.Archivo != null) 
                {
                    if(!new []{"jpeg", "jpg", "gif", "mp4", "webm", "png"}.Contains(vm.Archivo.ContentType.Split("/")[1]))
                    {
                        ModelState.AddModelError("El  formato del archivo no es soportado", "");
                        return BadRequest(ModelState);
                    }
                        media = await mediaService.GenerarMediaDesdeArchivo(vm.Archivo);
                } else  if (!string.IsNullOrWhiteSpace(vm.Link))
                {
                    media = await mediaService.GenerarMediaDesdeLink(vm.Link);
                }
            }
            catch (Exception e) {
                ModelState.AddModelError("El  formato del archivo no es soportado", "");
                Console.WriteLine(e);
                return BadRequest(ModelState);
            }
            if(media != null)
            {
                comentario.Media = media;
                comentario.MediaId = media.Id;
            }

            //Agrego rango y nombre
            if(User.EsMod())
            {
                if(vm.MostrarNombre) comentario.Nombre = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name")?.Value ?? "";
                if(vm.MostrarRango) comentario.Rango = CreacionRango.Mod;
            }

            await comentarioService.Guardar(comentario);


            var model = new ComentarioViewModel(comentario, hilo);
            model.EsOp = hilo.UsuarioId == User.GetId();

            await rchanHub.Clients.Group(comentario.HiloId).SendAsync("NuevoComentario", model);
            await rchanHub.Clients.Group("home").SendAsync("HiloComentado", hilo.Id, comentario.Contenido);

            var comentarioMod = new ComentarioViewModelMod(comentario){HiloId = hilo.Id};
            await rchanHub.Clients.Group("moderacion").SendAsync("NuevoComentarioMod", comentarioMod);
            
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
    [MaxLength(3000, ErrorMessage="Pero este comentario es muy largo padre")]
    public string Contenido { get; set; } = "";
    public IFormFile Archivo { get; set; }
    public string Link { get; set; }
    public bool MostrarRango { get; set; } = false;
    public bool MostrarNombre { get; set; } = false;
}
