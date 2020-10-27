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

        #region constructor
        public HiloApiController(
            IHiloService hiloService,
            IMediaService mediaService,
            HashService hashService,
            IHubContext<RChanHub> rchanHub,
            RChanContext context
        )
        {
            this.hiloService = hiloService;
            this.mediaService = mediaService;
            this.hashService = hashService;
            this.rchanHub = rchanHub;
            this.context = context;
        }
        #endregion

        [Authorize]
        public async Task<ActionResult<ApiResponse>> Crear([FromForm] CrearHiloViewModel vm)
        {
            bool existeLaCategoria = Constantes.Categorias.Any(c => c.Id == vm.CategoriaId);

            if(!existeLaCategoria) ModelState.AddModelError("Categoria", "Ay no existe la categoria");

            if (!ModelState.IsValid) return BadRequest(ModelState);
            // Chequeuear si es flood
            // Chequeuear si esta Baneado
            var hilo = new HiloModel
            {
                UsuarioId = User.GetId(),
                Titulo = vm.Titulo,
                Contenido = vm.Contenido,
                CategoriaId = vm.CategoriaId,
                Bump = DateTimeOffset.Now,
                //Ip = HttpContext.Connection.RemoteIpAddress,
            };


            if (vm.Archivo != null)
            {
                if (vm.Archivo.ContentType.Contains("image"))
                {
                    var media = await mediaService.GenerarDesdeImagen(vm.Archivo);
                    hilo.Media = media;
                    hilo.MediaId = media.Id;
                }
                else
                {
                    ModelState.AddModelError("El archivo debe ser una imagen", "");
                    return BadRequest(ModelState);
                }
            }

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