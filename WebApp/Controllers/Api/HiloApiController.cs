using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore;
using Microsoft.Extensions.Logging;
using Servicios;
using System.Collections.Generic;
using Modelos;
using System.Threading.Tasks;
using System.Net;
using System;
using WebApp;
using Microsoft.AspNetCore.Authorization;
using Data;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace WebApp.Controllers
{
    [ApiController, Route("api/Hilo/{action}/{id?}")]
    public class HiloApiController : ControllerBase
    {
        private readonly IHiloService hiloService;
        private readonly IMediaService mediaService;
        private readonly HashService hashService;
        private readonly IHubContext<RChanHub> rchanHub;
        private readonly RChanContext context;
        private readonly IOptions<List<Categoria>> categoriasOpt;
        private readonly IOptionsSnapshot<GeneralOptions> generalOptions;
        private readonly CaptchaService captcha;
        private readonly AntiFloodService antiFlood;

        #region constructor
        public HiloApiController(
            IHiloService hiloService,
            IMediaService mediaService,
            HashService hashService,
            IHubContext<RChanHub> rchanHub,
            RChanContext context,
            IOptions<List<Categoria>> categoriasOpt,
            IOptionsSnapshot<GeneralOptions> generalOptions,
            CaptchaService captcha,
            AntiFloodService antiFlood
        )
        {
            this.hiloService = hiloService;
            this.mediaService = mediaService;
            this.hashService = hashService;
            this.rchanHub = rchanHub;
            this.context = context;
            this.categoriasOpt = categoriasOpt;
            this.generalOptions = generalOptions;
            this.captcha = captcha;
            this.antiFlood = antiFlood;
        }
        #endregion

        [Authorize]
        public async Task<ActionResult<ApiResponse>> Crear([FromForm] CrearHiloViewModel vm)
        {
            bool existeLaCategoria = categoriasOpt.Value.Any(c => c.Id == vm.CategoriaId);

            if(!existeLaCategoria) ModelState.AddModelError("Categoria", "Ay no existe la categoria");
            if(vm.Archivo is null && string.IsNullOrWhiteSpace(vm.Link))
                ModelState.AddModelError("adjunto", "Para crear un roz tenes que adjuntar un archivo o un link");

            var pasoElCaptcha= await captcha.Verificar(vm.Captcha);
            if(!pasoElCaptcha && generalOptions.Value.CaptchaHilo && !User.EsMod())
            {
                 ModelState.AddModelError("Captcha", "Incorrecto");
            }
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Chequeuear si es flood
            if(antiFlood.SegundosParaHilo(User)  != new TimeSpan(0))
            {
                ModelState.AddModelError("Para para", $"faltan {antiFlood.SegundosParaHilo(User).Minutes} minutos para que pudeas crear otro roz");
                return BadRequest(ModelState);
            }else {
                antiFlood.HaCreadoHilo(User.GetId());
            }

            // Chequeuear si esta Baneado
            var ip = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
            System.Console.WriteLine(ip);
            var hilo = new HiloModel
            {
                UsuarioId = User.GetId(),
                Titulo = vm.Titulo,
                Contenido = vm.Contenido,
                CategoriaId = vm.CategoriaId,
                Bump = DateTimeOffset.Now,
                // Ip = HttpContext.Connection.RemoteIpAddress,
            };

            MediaModel media = null;
            if (vm.Archivo != null)
            {
                if(!new []{"jpeg", "jpg", "gif", "mp4", "webm", "png"}.Contains(vm.Archivo.ContentType.Split("/")[1]))
                {
                    ModelState.AddModelError("Archivo invalido", "");
                    return BadRequest(ModelState);
                }
                    media = await mediaService.GenerarMediaDesdeArchivo(vm.Archivo);
            }
            else  if (!string.IsNullOrWhiteSpace(vm.Link))
            {
                media = await mediaService.GenerarMediaDesdeLink(vm.Link);
            }

            if(media is null)
            {
                ModelState.AddModelError("Chocamo", "No se pudo importar el link");
                return BadRequest(ModelState);
            }

            hilo.Media = media;
            hilo.MediaId = media.Id;

            string id = await hiloService.GuardarHilo(hilo);
            
            // El op sigue a su hilo
            context.HiloAcciones.Add( new HiloAccionModel {
                Id = hashService.Random(),
                Seguido = true,
                UsuarioId = hilo.UsuarioId,
                HiloId = id,
            });

            await context.SaveChangesAsync();
            await rchanHub.Clients.Group("home").SendAsync("HiloCreado", new HiloViewModel(hilo));

            return Created($"/Hilo/{id}", null);
        }

        [HttpPost, Authorize]
        public async Task<ActionResult<ApiResponse>> Agregar([FromBody] AccionVM model)
        {
            if (!await context.Hilos.AnyAsync(h => h.Id == model.HiloId)) return NotFound();
            var acciones = await context.HiloAcciones
                .FirstOrDefaultAsync(a => a.UsuarioId == User.GetId() && a.HiloId == model.HiloId);

            if (acciones == null)
            {
                acciones = new HiloAccionModel
                {
                    Id = hashService.Random(),
                    UsuarioId = User.GetId(),
                    HiloId = model.HiloId,
                };
                await context.HiloAcciones.AddAsync(acciones);
            }

            var añadido = false;
            if (model.Accion == "favoritos")
            {
                añadido = acciones.Favorito = !acciones.Favorito;
            }
            else if (model.Accion == "seguidos")
            {
                añadido = acciones.Seguido = !acciones.Seguido;
            }
            else if (model.Accion == "ocultos")
            {
                añadido = acciones.Hideado = !acciones.Hideado;
            }

            await context.SaveChangesAsync();
            return new ApiResponse($"{(añadido? "añadido a" : "removido de")} {model.Accion}");
        }

        [Produces("application/json")]
        public async Task<ActionResult<ApiResponse>> Get(string id)
        {
            var hilo = await hiloService.GetHiloFull(id, User.GetId());
            if (hilo is null) return NotFound();
            return new ApiResponse(value: hilo);
        }

        async public Task<ActionResult<ApiResponse>> Index()
        {
            return new ApiResponse(value: hiloService.GetHilosOrdenadosPorBump());
        }

        [AllowAnonymous]
        async public Task<ActionResult<ApiResponse>> Denunciar( DenunciaModel denuncia)
        {
            if(denuncia.ComentarioId == "") denuncia.ComentarioId = null;
            denuncia.Id = hashService.Random();
            if(await context.Hilos.AnyAsync(h => h.Id == denuncia.HiloId && h.Estado ==  HiloEstado.Eliminado))
            {
                ModelState.AddModelError("hilo", "No se encontro el hilo");
            }
            var yaDenuncio = await context.Denuncias
                .AnyAsync(d => d.UsuarioId == (User.GetId()?? "Anonimo") &&
                    d.Tipo == denuncia.Tipo && denuncia.HiloId == d.HiloId);

            if(yaDenuncio) ModelState.AddModelError("hilo", "Ya denunciaste esto");

            if(User != null) {

                denuncia.UsuarioId = User.GetId();
            }
            if(!ModelState.IsValid) return BadRequest(ModelState);
            
            denuncia.Estado = EstadoDenuncia.NoRevisada;
            context.Denuncias.Add(denuncia);
            
            await context.SaveChangesAsync();
            return new ApiResponse("Denuncia enviada");
        }

        [AllowAnonymous]
        async public Task<ActionResult> CargarMas([FromQuery]DateTimeOffset ultimoBump, [FromQuery] string categorias) 
        {    
            var hilos = context.Hilos
                .OrdenadosPorBump()
                .FiltrarNoActivos()
                .FiltrarOcultosDeUsuario(User.GetId(), context)
                .FiltrarPorCategoria(categorias.Split(",").Select(c => Convert.ToInt32(c)).ToArray())
                .Where(h => h.Bump < ultimoBump)
                .Take(16)
                .AViewModel(context);

            return Ok(hilos);
        }
    }

    public class ApiResponse
    {
        public bool Success { get; set; }
        public string Mensaje { get; set; }
        public dynamic Value { get; set; }

        public ApiResponse(string mensaje = "", bool success = true, dynamic value = null)
        {
            this.Success = success;
            this.Mensaje = mensaje;
            this.Value = value;

        }

    }

    public class AccionVM
    {
        public string HiloId { get; set; }
        public string Accion { get; set; }
    }

}