using Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Modelos;
using Servicios;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using WebApp.Otros;

namespace WebApp.Controllers
{
    public class HiloController : Controller
    {
        private readonly ILogger<HiloController> _logger;
        private readonly IHiloService hiloService;
        private readonly RChanContext context;
        private readonly IOptionsSnapshot<List<Categoria>> categoriasOpts;
        private readonly RChanCacheService rchanCacheService;
        private static Cache<List<HiloViewModel>> hilosCache;

        public IMediaService MediaService { get; }

        public HiloController(
            ILogger<HiloController> logger,
            IHiloService hiloService,
            RChanContext context,
            IOptionsSnapshot<List<Categoria>> categoriasOpts,
            RChanCacheService rchanCacheService,
            IMediaService mediaService)
        {
            _logger = logger;
            this.hiloService = hiloService;
            this.context = context;
            this.categoriasOpts = categoriasOpts;
            this.rchanCacheService = rchanCacheService;
            MediaService = mediaService;
        }

        public async Task<IActionResult> IndexAsync()
        {
            int[] categorias;
            if (User.Identity.IsAuthenticated)
            {
                categorias = categoriasOpts.Value.Sfw().Ids().ToArray();
                HttpContext.Request.Cookies.TryGetValue("categoriasActivas", out string categoriasActivas);
                if (categoriasActivas != null) categorias = JsonSerializer.Deserialize<int[]>(categoriasActivas);
            }
            else
            {
                categorias = categoriasOpts.Value.Public().Ids().ToArray();
            }

            var ocultos = (await context.HiloAcciones
                .Where(a => a.UsuarioId == User.GetId() && a.Hideado)
                .Select(a => a.HiloId)
                .ToArrayAsync())
                .ToHashSet();

            var vm = new HiloListViewModel
            {

                Hilos = rchanCacheService.hilosIndex.Where(h => !ocultos.Contains(h.Id) && categorias.Contains(h.CategoriaId)).Take(16).ToList(),
                CategoriasActivas = categorias.ToList()
            };
            return View(vm);
        }

        [HttpGet("/Favoritas")]
        public async Task<IActionResult> Favoritas()
        {
            int[] categorias = new int[] { };

            HttpContext.Request.Cookies.TryGetValue("categoriasFavoritas", out string categoriasActivas);

            if (categoriasActivas != null) categorias = JsonSerializer.Deserialize<int[]>(categoriasActivas);

            var vm = new HiloListViewModel
            {
                Hilos = await hiloService.GetHilosOrdenadosPorBump(new GetHilosOptions
                {
                    UserId = User.GetId(),
                    CategoriasId = categorias,
                    IncluirStickies = true
                }),
                CategoriasActivas = categorias.ToList()
            };
            return View("Index", vm);
        }
        [HttpGet("/Nuevos")]
        public async Task<IActionResult> Nuevos()
        {
            int[] categorias;
            if (User.Identity.IsAuthenticated)
            {
                categorias = categoriasOpts.Value.Sfw().Ids().ToArray();
                HttpContext.Request.Cookies.TryGetValue("categoriasActivas", out string categoriasActivas);
                if (categoriasActivas != null) categorias = JsonSerializer.Deserialize<int[]>(categoriasActivas);
            }
            else
            {
                categorias = categoriasOpts.Value.Public().Ids().ToArray();
            }

            var ocultos = (await context.HiloAcciones
                .Where(a => a.UsuarioId == User.GetId() && a.Hideado)
                .Select(a => a.HiloId)
                .ToArrayAsync())
                .ToHashSet();

            var vm = new HiloListViewModel
            {

                Hilos = rchanCacheService.hilosIndex
                    .Select((h, index) => new { h, index })
                    .OrderBy(a => rchanCacheService.creacionIndex[a.index])
                    .Select(a => a.h)
                    .Where(h => !ocultos.Contains(h.Id) && categorias.Contains(h.CategoriaId))
                    .Where(h => h.Sticky == 0)
                    .Take(16)
                    .ToList(),
                CategoriasActivas = categorias.ToList(),
                Nuevos = true
            };
            return View("Index", vm);
        }

        [HttpGet("Hilo/{id}")]
        public async Task<IActionResult> MostrarAsync(string id)
        {
            // var hilo = await hiloService.GetHiloFull(id, User.GetId());
            IHiloFullView hilo;
            if (User.EsMod())
            {
                hilo = await hiloService.GetHiloFullMod(id, User.GetId(), true);
            }
            else
            {
                hilo = await hiloService.GetHiloFull(id, User.GetId());
            }
            if (hilo is null) return Redirect("/Error/404");
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
            var cate = categoriasOpts.Value.FirstOrDefault(c => c.NombreCorto.ToLower() == categoria.ToLower());
            if (cate == null)
            {
                return Redirect("/Error/404");
            };

            var vm = new HiloListViewModel
            {

                // Hilos = await context.Hilos
                //     .Where(h => h.CategoriaId == cate.Id)
                //     .AsNoTracking()
                //     .OrdenadosPorBump()
                //     .FiltrarOcultosDeUsuario(User.GetId(), context)
                //     .FiltrarNoActivos()
                //     .Take(16)
                //     .AViewModel(context)
                //     .ToListAsync(),
                Hilos = await hiloService.GetCategoria(cate.Id, User.GetId()),
                CategoriasActivas = new int[] { cate.Id }.ToList()
            };
            return View("Index", vm);
        }

        [Authorize]
        [HttpGet("/Mis/{coleccion?}")]
        public async Task<IActionResult> Coleciones(string coleccion)
        {
            if (coleccion == null || !"favoritos ocultos seguidos creados".Split(" ").Contains(coleccion.ToLower()))
            {
                return Redirect("/Error/404");
            }
            coleccion = coleccion.ToLower();
            var query = hiloService
                .OrdenadosPorBump()
                .FiltrarNoActivos();

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

            var hilos = await query.AViewModel(context).ToListAsync();
            var vm = new HiloListViewModel { Hilos = hilos, CategoriasActivas = new List<int>() };
            return View("Index", vm);
        }

        [HttpGet("/Buscar")]
        public IActionResult Buscar()
        {
            return View();
        }

        [HttpGet("/Archivo")]
        public async Task<IActionResult> ArchivoAsync()
        {
            var archivados = await context.Hilos
                .Where(h => h.Estado == HiloEstado.Archivado)
                .OrderByDescending(h => h.Bump)
                .Select(h => new { h.Titulo, h.Id, h.Estado, h.Bump, Historico = h.Flags.Contains("h") })
                .Take(3000)
                .ToListAsync();
            return View(archivados);
        }
        [HttpGet("/Serios")]
        public async Task<IActionResult> SeriosAsync()
        {
            int[] categorias = categoriasOpts.Value.Sfw().Ids().ToArray();
            HttpContext.Request.Cookies.TryGetValue("categoriasActivas", out string categoriasActivas);
            if (categoriasActivas != null) categorias = JsonSerializer.Deserialize<int[]>(categoriasActivas);

            var hilos = await context.Hilos
                .AsNoTracking()
                .OrdenadosPorBump()
                .FiltrarNoActivos()
                .FiltrarOcultosDeUsuario(User.GetId(), context)
                .FiltrarPorCategoria(categorias)
                .Where(h => !context.Stickies.Any(s => s.HiloId == h.Id && !s.Global))
                .Where(h => h.Flags.Contains("s"))
                .Take(32)
                .AViewModel(context)
                .ToListAsync();
            return View("Index", new HiloListViewModel { Hilos = hilos, CategoriasActivas = categorias.ToList(), Serios = true });
        }

        private UsuarioVm GetUserInfo()
        {
            return new UsuarioVm
            {
                EstaAutenticado = User.Identity.IsAuthenticated,
                UserName = User.Identity.Name,
                EsAdmin = User.EsAdmin(),
                EsMod = User.EsMod(),
                EsAuxiliar = User.EsAuxiliar(),
            };
        }

        private async Task<List<NotificacionViewModel>> GetNotis()
        {
            if (User is null) return null;
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
    public bool EsAuxiliar { get; set; }
}

public class HiloListViewModel
{
    public List<HiloViewModel> Hilos { get; set; }
    public List<int> CategoriasActivas { get; set; }
    public bool Serios { get; set; } = false;
    public bool Nuevos { get; set; } = false;
}
