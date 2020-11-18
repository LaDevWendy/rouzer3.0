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
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.IO;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Hosting;
using System.ComponentModel.DataAnnotations;

namespace WebApp.Controllers
{
    [Authorize("esMod")]
    [ApiController, Route("api/Moderacion/{action}/{id?}")]
    public class Moderacion : Controller
    {
        private readonly IHiloService hiloService;
        private readonly IMediaService mediaService;
        private readonly HashService hashService;
        private readonly IHubContext<RChanHub> rchanHub;
        private readonly RChanContext context;
        private readonly UserManager<UsuarioModel> userManager;
        private readonly SignInManager<UsuarioModel> signInManager;
        private readonly IOptions<GeneralOptions> config;

        public Moderacion(
            IHiloService hiloService,
            IMediaService mediaService,
            HashService hashService,
            IHubContext<RChanHub> rchanHub,
            RChanContext context,
            UserManager<UsuarioModel> userManager,
            SignInManager<UsuarioModel> signInManager,
            IOptionsSnapshot<GeneralOptions> config
        )
        {
            this.hiloService = hiloService;
            this.mediaService = mediaService;
            this.hashService = hashService;
            this.rchanHub = rchanHub;
            this.context = context;
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.config = config;
        }

        [Route("/Moderacion")]
        public async Task<ActionResult> Index()
        {
            var hilos = await context.Hilos.OrderByDescending(h => h.Creacion)
                .Take(100)
                .AViewModelMod(context)
                .ToListAsync();

            var comentarios = await context.Comentarios.OrderByDescending(c => c.Creacion)
                .Take(100)
                .Include(c => c.Media)
                .Select(c => new ComentarioViewModelMod {
                    HiloId = c.HiloId,
                    UsuarioId = c.UsuarioId,
                    Contenido = c.Contenido,
                    Id = c.Id,
                    Creacion = c.Creacion,
                    Media = c.Media
                }).ToListAsync();

            var denuncias = await context.Denuncias
                .OrderByDescending(d => d.Creacion)
                .Take(100)
                .Include(d => d.Hilo)
                .Include(d => d.Usuario)
                .Include(d => d.Comentario)
                .Include(d => d.Comentario.Media)
                .Include(d => d.Hilo.Media)
                .Include(d => d.Hilo.Usuario)
                .ToListAsync();
            return View(new ModeracionIndexVm(hilos, comentarios, denuncias));
        }

        
        [HttpGet]
         [Route("/Moderacion/HistorialDeUsuario/{id}")]
        public async Task<ActionResult> HistorialDeUsuario(string id) 
        {
            if((await context.Usuarios.FirstOrDefaultAsync(u => u.Id == id)) is null)
                return NotFound();
            return View(new {
                Hilos = await context.Hilos
                    .DeUsuario(id)
                    .Recientes()
                    .AViewModelMod(context)
                    .ToListAsync(),

                Comentarios = await context.Comentarios
                    .Recientes()
                    .DeUsuario(id)
                    .Take(150)
                    .ToListAsync()

            });
        }

        [HttpPost]
        public async Task<ActionResult> Banear(BanViewModel model) 
        {
            // var baneado = context.Users.FirstOrDefault(u => u.Id )
            var comentario = await context.Comentarios.FirstOrDefaultAsync(c => c.Id == model.ComentarioId);
            var hilo = await context.Hilos.FirstOrDefaultAsync(h => h.Id == model.HiloId);
            var tipo = comentario is null? Tipo.Hilo : Tipo.Comentario;

            CreacionUsuario elemento = comentario ?? (CreacionUsuario)hilo;

            var ban = new BaneoModel{
                Id = hashService.Random(),
                Aclaracion = model.Aclaracion,
                ComentarioId = model.ComentarioId,
                Creacion = DateTimeOffset.Now,
                Expiracion = DateTimeOffset.Now + TimeSpan.FromMinutes(model.Duracion),
                ModId = User.GetId(),
                Motivo = model.Motivo,
                Tipo = tipo,
                HiloId = model.HiloId,
                Ip = elemento.Ip,
                UsuarioId = tipo == Tipo.Comentario? comentario.UsuarioId : hilo.UsuarioId,
            };

            context.Bans.Add(ban);
            // Si se marco la opcion para eliminar elemento, borro el hilo o el comentario

            if(comentario != null)
            {
                comentario.Estado = ComentarioEstado.Eliminado;
            } 
            else if(hilo != null)
            {
                hilo.Estado = HiloEstado.Eliminado;
            }
            await context.SaveChangesAsync();
            return Json(new ApiResponse("Usuario Baneado"));
        }

        [HttpPost]
        public async Task<ActionResult> RechazarDenuncia(string id) 
        {
            var denuncia = await context.Denuncias.FirstOrDefaultAsync(d => d.Id == id);
            
            if(denuncia is null) 
            {
                ModelState.AddModelError("Denuncia", "No se encontro la denuncia");
                return BadRequest(ModelState);
            }

            denuncia.Estado = EstadoDenuncia.Rechazada;
            await context.SaveChangesAsync();
            return Json(new ApiResponse("Denuncia rechazada"));
        }

        [HttpPost]
        public async Task<ActionResult> EliminarComentarios(string[] ids) 
        {
            var comentarios = await context.Comentarios
                .Where(c => ids.Contains(c.Id))
                .Where(c => c.Estado != ComentarioEstado.Eliminado)
                .ToListAsync();

             comentarios.ForEach(c => c.Estado = ComentarioEstado.Eliminado);

            int eliminados = await context.SaveChangesAsync();
            return Json(new ApiResponse($"{eliminados} comentarios eliminados"));
        }

    }
    public class ModeracionIndexVm {
        public ModeracionIndexVm(List<HiloViewModelMod> hilos, List<ComentarioViewModelMod> comentarios, List<DenunciaModel> denuncias)
        {
            this.Hilos = hilos;
            this.Comentarios = comentarios;
            this.Denuncias = denuncias;
        }

        public List<HiloViewModelMod> Hilos { get; set; }
        public List<ComentarioViewModelMod> Comentarios { get; set; }
        public List<DenunciaModel> Denuncias { get; set; }
    }

    public class BanViewModel
    {
        public string UsuarioId { get; set; }
        public string HiloId { get; set; }
        [Required]
        public MotivoDenuncia Motivo { get; set; }
        public string Aclaracion { get; set; }
        public string ComentarioId { get; set; }
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Tenes que elegir una duracion para el ban")]
        public int Duracion { get; set; }
        public bool EliminarElemento { get; set; }
        public bool EliminarAdjunto { get; set; }
    }
}