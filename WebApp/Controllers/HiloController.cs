using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore;
using Microsoft.Extensions.Logging;
using Servicios;
using System.Collections.Generic;
using Modelos;
using System.Threading.Tasks;
using Data;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;



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
            var vm = new HiloListViewModel
            {
                Hilos = await hiloService.GetHilosOrdenadosPorBump( new GetHilosOptions {
                    UserId = User.GetId()
                }),
            };
            return View(vm);
        }

        [HttpGet("Hilo/{id}")]
        public async Task<IActionResult> MostrarAsync(string id)
        {
            var hilo = await hiloService.GetHiloFull(id, User.GetId());
            if (hilo is null) return NotFound();
            return View(hilo);
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
            if(coleccion == null || !"favoritos ocultos seguidos creados".Split(" ").Contains(coleccion.ToLower()))
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

            var hilos = await query.AViewModel(context).ToListAsync();
            var vm = new HiloListViewModel { Hilos = hilos};
            return View("Index", vm);
        }

    }

    public class HiloListViewModel
    {
        public List<HiloViewModel> Hilos { get; set; }
    }

}