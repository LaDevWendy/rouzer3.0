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
using Microsoft.Extensions.Options;

namespace WebApp.Controllers
{
    [ApiController, Route("api/Comentario/{action}/{id?}")]
    public class ComentarioApiControlelr : Controller
    {
        private readonly IComentarioService comentarioService;
        private readonly RChanContext context;
        private readonly IHubContext<RChanHub> rchanHub;
        private readonly NotificacioensService notificacioensService;
        private readonly AntiFloodService antiFlood;
        private readonly IOptionsSnapshot<GeneralOptions> gnrlOpts;
        private readonly EstadisticasService estadisticasService;
        private readonly IMediaService mediaService;
        private readonly CensorService censorService;
        private readonly HashService hashService;
        private readonly IAudioService audioService;

        public ComentarioApiControlelr(
            IComentarioService comentarioService,
            IMediaService mediaService,
            RChanContext chanContext,
            IHubContext<RChanHub> rchanHub,
            NotificacioensService notificacioensService,
            AntiFloodService antiFlood,
            IOptionsSnapshot<GeneralOptions> gnrlOpts,
            EstadisticasService estadisticasService,
            CensorService censorService,
            HashService hashService,
            IAudioService audioService
        )
        {
            this.comentarioService = comentarioService;
            this.context = chanContext;
            this.rchanHub = rchanHub;
            this.notificacioensService = notificacioensService;
            this.antiFlood = antiFlood;
            this.gnrlOpts = gnrlOpts;
            this.estadisticasService = estadisticasService;
            this.mediaService = mediaService;
            this.censorService = censorService;
            this.hashService = hashService;
            this.audioService = audioService;
        }

        [HttpPost, Authorize, ValidateAntiForgeryToken]
        public async Task<ActionResult<ApiResponse>> Crear([FromForm] CrearComentarioViewModel vm)
        {
            if (vm.Contenido is null) vm.Contenido = "";
            if (string.IsNullOrWhiteSpace(vm.Contenido) && vm.Archivo is null && string.IsNullOrWhiteSpace(vm.Link) && vm.Audio is null)
                ModelState.AddModelError("uy!", "El comentario no puede estar vacio padre");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var hilo = await context.Hilos
                .Include(h => h.Media)
                .FirstOrDefaultAsync(c => c.Id == vm.HiloId);

            if (hilo is null) return Redirect("/Error/404");

            if (hilo.Estado != HiloEstado.Normal)
            {
                ModelState.AddModelError("Jeje", hilo.Estado == HiloEstado.Archivado ? "Este roz esta archivado" : "El roz fue domado");
                return BadRequest(ModelState);
            }

            if (antiFlood.SegundosParaComentar(User) != new TimeSpan(0))
            {
                ModelState.AddModelError("Para para", $"faltan {antiFlood.SegundosParaComentar(User).Seconds} para que puedas comentar");
                return BadRequest(ModelState);
            }
            else
            {
                antiFlood.HaComentado(User.GetId());
            }

            var comentariosIdsTageados = comentarioService.GetIdsTageadas(vm.Contenido);

            if (comentariosIdsTageados.Length > 5)
            {
                ModelState.AddModelError("Jeje", "No podes taguear mas de 5 comentarios. Ok?");
                antiFlood.ResetearSegundosComentario(User.GetId());
                return BadRequest(ModelState);
            }

            var ip = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();

            var comentario = new ComentarioModel
            {
                UsuarioId = User.GetId(),
                HiloId = vm.HiloId,
                Contenido = vm.Contenido,
                Creacion = DateTimeOffset.Now,
                Ip = ip,
                FingerPrint = vm.FingerPrint
            };

            MediaModel media = null;
            try
            {
                if (vm.Archivo != null)
                {
                    if (!new[] { "jpeg", "jpg", "gif", "mp4", "webm", "png" }.Contains(vm.Archivo.ContentType.Split("/")[1]))
                    {
                        ModelState.AddModelError("El  formato del archivo no es soportado", "");
                        antiFlood.ResetearSegundosComentario(User.GetId());
                        return BadRequest(ModelState);
                    }
                    media = await mediaService.GenerarMediaDesdeArchivo(vm.Archivo, User.EsMod());
                }
                else if (!string.IsNullOrWhiteSpace(vm.Link))
                {
                    media = await mediaService.GenerarMediaDesdeLink(vm.Link, User.EsMod());
                }
            }
            catch (Exception e)
            {
                ModelState.AddModelError("El archivo es muy pesado (+10mb) o el formato no es soportado", "");
                Console.WriteLine(e);
                antiFlood.ResetearSegundosComentario(User.GetId());
                return BadRequest(ModelState);
            }
            if (media != null)
            {
                comentario.Media = media;
                comentario.MediaId = media.Id;
            }

            if (hilo.Flags.Contains("a"))
            {
                AudioModel audio = null;
                try
                {
                    if (vm.Audio != null)
                    {
                        audio = await audioService.GenerarAudio(vm.Audio);
                    }
                }
                catch (Exception e)
                {
                    ModelState.AddModelError("No se pudo subir el audio", "");
                    Console.WriteLine(e);
                    antiFlood.ResetearSegundosComentario(User.GetId());
                    return BadRequest(ModelState);
                }

                if (audio != null)
                {
                    comentario.Audio = audio;
                    comentario.AudioId = audio.Id;
                }
            }

            // Agrego rango y nombre
            if (User.EsMod())
            {
                if (vm.MostrarNombre) comentario.Nombre = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name")?.Value ?? "";
                if (vm.MostrarRango) comentario.Rango = CreacionRango.Mod;
            }
            if (!User.EsMod() && User.EsAuxiliar(gnrlOpts.Value.ModoSerenito))
            {
                if (vm.MostrarNombre) comentario.Nombre = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name")?.Value ?? "";
                if (vm.MostrarRango) comentario.Rango = CreacionRango.Auxiliar;
            }

            // Agrego el pais del uusario
            if (Request.Headers.TryGetValue("cf-ipcountry", out var paisValue) && (string.IsNullOrEmpty(comentario.Nombre) || comentario.Rango != CreacionRango.Anon))
            {
                comentario.Pais = paisValue.ToString().ToLower();
            }

            string id = await comentarioService.Guardar(comentario);

            var model = new ComentarioViewModel(comentario, hilo);
            model.EsOp = hilo.UsuarioId == User.GetId();

            await rchanHub.Clients.User(comentario.UsuarioId).SendAsync("ComentarioPropio", comentario.Id);
            await rchanHub.Clients.User(comentario.Hilo.UsuarioId).SendAsync("SoyOp", comentario.Id);
            await rchanHub.Clients.Group(comentario.HiloId).SendAsync("NuevoComentario", model);
            await rchanHub.Clients.Group("home").SendAsync("HiloComentado", hilo.Id, comentario.Contenido);

            var comentarioMod = new ComentarioViewModelMod(comentario) { HiloId = hilo.Id };
            await rchanHub.Clients.Group("moderacion").SendAsync("NuevoComentarioMod", comentarioMod);

            await notificacioensService.Notificar(hilo, comentario);


            await estadisticasService.RegistrarNuevoComentario();

            // Checkear si es historico
            if (!hilo.Flags.Contains("h"))
            {
                var cantidadComentarios = await context.Comentarios
                    .Where(c => c.Estado == ComentarioEstado.Normal)
                    .Where(c => c.HiloId == hilo.Id)
                    .CountAsync();
                if (cantidadComentarios >= 1000) hilo.Flags += "h";
            }
            //Roz de concentracion
            if (hilo.Flags.Contains("c"))
            {
                var cantidadComentarios = await context.Comentarios
                    .Where(c => c.Estado == ComentarioEstado.Normal)
                    .Where(c => c.HiloId == hilo.Id)
                    .CountAsync();

                if (cantidadComentarios >= 500)
                {
                    var comentarioEliminar = await context.Comentarios
                        .Where(c => c.HiloId == hilo.Id)
                        .Where(c => c.Estado == ComentarioEstado.Normal)
                        .OrderByDescending(c => c.Creacion)
                        .Skip(10)
                        .ToListAsync();
                    comentarioEliminar.ForEach(c => c.Estado = ComentarioEstado.Eliminado);

                    var comentarioBorrar = await context.Comentarios
                        .Where(c => c.HiloId == hilo.Id)
                        .Where(c => !context.Bans.Any(b => b.ComentarioId == c.Id))
                        .Where(c => !context.Denuncias.Any(b => b.ComentarioId == c.Id))
                        .Where(c => !context.Notificaciones.Any(b => b.ComentarioId == c.Id))
                        .Where(c => c.Estado == ComentarioEstado.Normal)
                        .OrderByDescending(c => c.Creacion)
                        .Skip(10)
                        .ToListAsync();

                    context.Comentarios.RemoveRange(comentarioBorrar);
                };
            }

            await context.SaveChangesAsync();
            if (censorService.BuscarPalabras(comentario.Contenido))
            {
                DenunciaVM denunciaAutomatica = new DenunciaVM();
                denunciaAutomatica.Tipo = TipoElemento.Comentario;
                denunciaAutomatica.Motivo = MotivoDenuncia.ContenidoIlegal;
                denunciaAutomatica.HiloId = hilo.Id;
                denunciaAutomatica.ComentarioId = id;
                denunciaAutomatica.Aclaracion = "[Denuncia automática] Se mencionó palabra en la lista negra";
                await AutoDenunciar(denunciaAutomatica);
            }

            if (censorService.BuscarPalabras(comentario.FingerPrint))
            {
                DenunciaVM denunciaAutomatica = new DenunciaVM();
                denunciaAutomatica.Tipo = TipoElemento.Comentario;
                denunciaAutomatica.Motivo = MotivoDenuncia.ContenidoIlegal;
                denunciaAutomatica.HiloId = hilo.Id;
                denunciaAutomatica.ComentarioId = id;
                denunciaAutomatica.Aclaracion = $"[Denuncia automática] Usuario sospechoso FP: {comentario.FingerPrint}";
                await AutoDenunciar(denunciaAutomatica);
            }

            return new ApiResponse("Comentario creado!");
        }

        async private Task<ActionResult<ApiResponse>> AutoDenunciar(DenunciaVM vc)
        {
            var denuncia = new DenunciaModel
            {
                Tipo = vc.Tipo,
                HiloId = vc.HiloId,
                ComentarioId = vc.ComentarioId,
                Motivo = vc.Motivo,
                Aclaracion = vc.Aclaracion,
            };

            denuncia.Id = hashService.Random();
            denuncia.UsuarioId = "6dc9e3f2-3bdb-4c0d-8370-01c926ab454a";
            if (!ModelState.IsValid) return BadRequest(ModelState);
            denuncia.Estado = EstadoDenuncia.NoRevisada;
            context.Denuncias.Add(denuncia);
            await context.SaveChangesAsync();

            //Mandar denuncia a los medz
            denuncia = await context.Denuncias
                .Include(d => d.Hilo)
                .Include(d => d.Usuario)
                .Include(d => d.Comentario)
                .Include(d => d.Comentario.Media)
                .Include(d => d.Comentario.Usuario)
                .Include(d => d.Hilo.Media)
                .Include(d => d.Hilo.Usuario)
                .SingleAsync(d => d.Id == denuncia.Id);

            await rchanHub.Clients.Group("moderacion").SendAsync("nuevaDenuncia", new
            {
                Hilo = new HiloViewModelMod(denuncia.Hilo) { Usuario = new UsuarioModel { UserName = denuncia.Hilo.Usuario.UserName, Id = denuncia.Hilo.Usuario.Id } },
                Comentario = denuncia.Comentario != null ? new ComentarioViewModelMod(denuncia.Comentario)
                {
                    Usuario = new UsuarioModel { Id = denuncia.Comentario.Usuario.Id, UserName = denuncia.Comentario.Usuario.UserName }
                } : null,
                denuncia.Estado,
                denuncia.Aclaracion,
                denuncia.Id,
                denuncia.Tipo,
                denuncia.UsuarioId,
                denuncia.Motivo,
                denuncia.Creacion,
                denuncia.HiloId,
                denuncia.ComentarioId,
                Usuario = new
                {
                    denuncia.Usuario.UserName,
                    denuncia.Usuario.Id,
                }
            });

            return new ApiResponse("Denuncia enviada");
        }


        [HttpPost]
        async public Task<ActionResult<ApiResponse>> Stickear(string id = "")
        {
            var comentario = await context.Comentarios.Include(c => c.Hilo).FirstOrDefaultAsync(c => c.Id == id);
            if (comentario == null)
            {
                ModelState.AddModelError("Error", "No existe ese comentario.");
                return BadRequest(ModelState);
            }
            if (comentario.Hilo.UsuarioId != User.GetId())
            {
                ModelState.AddModelError("Error", "No sos el OP.");
                return BadRequest(ModelState);
            }
            comentario.Sticky = !comentario.Sticky;
            await context.SaveChangesAsync();
            await rchanHub.Clients.Group(comentario.HiloId).SendAsync("NuevoSticky", id, comentario.Sticky);
            if (comentario.Sticky)
            {
                return Ok("Comentario stickeado");
            }
            return Ok("Comentario desestickeado");
        }

        async public Task<ActionResult<ApiResponse>> Ignorar(string id = "")
        {
            var comentario = await context.Comentarios.FirstOrDefaultAsync(c => c.Id == id);
            if (comentario == null)
            {
                ModelState.AddModelError("Error", "No existe ese comentario.");
                return BadRequest(ModelState);
            }
            if (comentario.UsuarioId != User.GetId())
            {
                ModelState.AddModelError("Error", "No es tu comentario.");
                return BadRequest(ModelState);
            }
            comentario.Ignorado = !comentario.Ignorado;
            await context.SaveChangesAsync();
            if (comentario.Ignorado)
            {
                return Ok("Comentario ignorado");
            }
            return Ok("Comentario no ignorado");
        }
    }
}
