using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Servicios;
using System.Collections.Generic;
using Modelos;
using System.Threading.Tasks;
using Data;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json.Serialization;

namespace WebApp.Controllers
{
    public class HiloController : Controller
    {
        private readonly ILogger<HiloController> _logger;
        private readonly IHiloService hiloService;
        private readonly RChanContext context;

        public IMediaService MediaService { get; }

        public HiloController(
            ILogger<HiloController> logger,
            IHiloService hiloService,
            RChanContext context,
            IMediaService mediaService)
        {
            _logger = logger;
            this.hiloService = hiloService;
            this.context = context;
            MediaService = mediaService;
        }

        public async Task<IActionResult> IndexAsync()
        {
            int[] categorias = Constantes.CantegoriasVisibles.Select(c => c.Id).ToArray();

            HttpContext.Request.Cookies.TryGetValue("categoriasActivas", out string categoriasActivas);

            if (categoriasActivas != null) categorias = JsonSerializer.Deserialize<int[]>(categoriasActivas);
            
            var hilos = await hiloService.GetHilosOrdenadosPorBump(new GetHilosOptions
            {
                UserId = User.GetId(),
                CategoriasId = categorias,
                IncluirStickies = true
            });
            
            // return Json(new {
            //     Hilos = hilos,
            //     Usuario = GetUserInfo(),
            //     Notificaciones = await GetNotis()
            // });
            var vm = new HiloListViewModel
            {
                Hilos = await hiloService.GetHilosOrdenadosPorBump(new GetHilosOptions
                {
                    UserId = User.GetId(),
                    CategoriasId = categorias,
                    IncluirStickies = true
                })
            };
            return View(vm);
        }

        [HttpGet("Hilo/{id}")]
        public async Task<IActionResult> MostrarAsync(string id)
        {
            var hilo = await hiloService.GetHiloFull(id, User.GetId());
            if (hilo is null) return NotFound();
            // return Json(new {
            //     hilo.Hilo,
            //     hilo.Comentarios,
            //     hilo.Acciones,
            //     Usuario = GetUserInfo(),
            //     Notificaciones = await GetNotis()
            // });
            return View("MostrarSvelte", hilo);
        }

        [Route("/{categoria}")] // Ej /anm, /art, /ytb
        public async Task<IActionResult> CategoriaAsync(string categoria)
        {
            var cate = Constantes.Categorias.FirstOrDefault(c => c.NombreCorto.ToLower() == categoria.ToLower());
            if (cate == null)
            {
                return NotFound();
            };

            var vm = new HiloListViewModel
            {
                Hilos = await hiloService.GetHilosOrdenadosPorBump(new GetHilosOptions
                {
                    UserId = User.GetId(),
                    CategoriasId = new int[] { cate.Id }
                }),
            };
            return View("Index", vm);
        }

        [Authorize]
        [HttpGet("/Mis/{coleccion?}")]
        public async Task<IActionResult> Coleciones(string coleccion)
        {
            if (coleccion == null || !"favoritos ocultos seguidos creados".Split(" ").Contains(coleccion.ToLower()))
            {
                return NotFound();
            }
            coleccion = coleccion.ToLower();
            var query = hiloService.OrdenadosPorBump();

            query = coleccion switch
            {
                "favoritos" => query.Where(h =>
                        context.HiloAcciones.Any(a => a.HiloId == h.Id && a.UsuarioId == User.GetId() && a.Favorito)),
                "ocultos" => query.Where(h =>
                        context.HiloAcciones.Any(a => a.HiloId == h.Id && a.UsuarioId == User.GetId() && a.Hideado)),
                "seguidos" => query.Where(h =>
                        context.HiloAcciones.Any(a => a.HiloId == h.Id && a.UsuarioId == User.GetId() && a.Seguido)),
                "creados" => query.Where(h => h.UsuarioId == User.GetId()),
                _ => null
            };
            query = query.Where(h => h.Estado != HiloEstado.Eliminado);
            var hilos = await query.AViewModel(context).ToListAsync();
            var vm = new HiloListViewModel { Hilos = hilos };
            return View("Index", vm);
        }

        private UsuarioVm GetUserInfo()
        {
            return new UsuarioVm
            {
                EstaAutenticado = User.Identity.IsAuthenticated,
                UserName = User.Identity.Name,
                EsAdmin = User.EsAdmin(),
                EsMod = User.EsMod(),
                EsAyudante = User.EsAyudante(),
            };
        }

        private async Task<List<NotificacionViewModel>> GetNotis()
        {
            if(User is null) return null;
            return await context.Notificaciones
                .Where(n => n.UsuarioId == User.GetId())
                .Select(n => new NotificacionViewModel
                {
                    Id = n.Id,
                    HiloId = n.HiloId,
                    HiloTitulo = context.Hilos.First(h => h.Id == n.HiloId).Titulo,
                    HiloImagen = context.Medias.First(m => m.Id == context.Hilos.First(h => h.Id == n.HiloId).MediaId).VistaPreviaCuadrado,
                    ComentarioId = n.ComentarioId,
                    Tipo = n.Tipo,
                    Conteo = n.Conteo,
                })
                .AsNoTracking()
                .ToListAsync();
        }
    }


}

class UsuarioVm
{
    public bool EstaAutenticado { get; set; }
    public string UserName { get; set; }
    public bool EsAdmin { get; set; }
    public bool EsMod { get; set; }
    public bool EsAyudante { get; set; }
}

public class HiloListViewModel
{
    public List<HiloViewModel> Hilos { get; set; }
}