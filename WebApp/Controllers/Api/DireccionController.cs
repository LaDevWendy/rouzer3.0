using Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Modelos;
using Servicios;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace WebApp.Controllers
{
    [Authorize("esDirector")]
    [ApiController, Route("api/Direccion/{action}/{id?}")]
    public class DireccionController : Controller
    {
        private readonly UserManager<UsuarioModel> userManager;
        private readonly SpamService spamService;
        private readonly PremiumService premiumService;
        private readonly HashService hashService;
        private readonly RChanContext context;
        private readonly IOptionsSnapshot<List<Membrecia>> membreciaOpts;
        private readonly IOptionsSnapshot<List<RouzCoin>> rouzCoinsOpts;
        private readonly IMediaService mediaService;

        public DireccionController(UserManager<UsuarioModel> userManager,
            SpamService spamService,
            PremiumService premiumService,
            HashService hashService,
            RChanContext context,
            IOptionsSnapshot<List<Membrecia>> membreciaOpts,
            IOptionsSnapshot<List<RouzCoin>> rouzCoinsOpts,
            IMediaService mediaService)
        {
            this.userManager = userManager;
            this.spamService = spamService;
            this.premiumService = premiumService;
            this.hashService = hashService;
            this.context = context;
            this.membreciaOpts = membreciaOpts;
            this.rouzCoinsOpts = rouzCoinsOpts;
            this.mediaService = mediaService;
        }
        [Route("/Direccion")]
        public async Task<IActionResult> IndexAsync()
        {
            var deveps = await userManager.GetUsersForClaimAsync(new Claim("Role", "dev"));
            var directores = await userManager.GetUsersForClaimAsync(new Claim("Role", "director"));

            var devs = deveps.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToArray();
            var dirs = directores.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToArray();

            var pedidosPendientes = await context.Pedidos.Where(p => p.Estado == PedidoEstado.Pendiente).Include(p => p.Usuario).OrderBy(p => p.Creacion).ToListAsync();

            var ahora = DateTimeOffset.Now;

            var ultimosPremiums = await context.AccionesCodigosPremium.
                Where(a => a.Tipo == TipoAccionCP.Uso).
                Include(a => a.CodigoPremium).
                Where(a => a.CodigoPremium.Tipo == TipoCP.ActivacionPremium).
                OrderByDescending(a => a.Creacion).
                Take(10).
                Select(a => context.Balances.Include(b => b.Usuario).FirstOrDefault(b => b.Id == a.UsuarioId)).
                ToListAsync();

            var vm = new DireccionVM
            {
                Devs = devs,
                Directores = dirs,
                Pedidos = pedidosPendientes,
                Premiums = ultimosPremiums
            };
            return View(vm);
        }

        [Route("/Direccion/Spams")]
        public async Task<ActionResult> Spams()
        {
            return View(new
            {
                Spams = await spamService.GetSpamsActivos()
            });
        }

        [HttpPost]
        public async Task<ActionResult> CrearSpam(CrearSpamVM model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            await spamService.Agregar(new SpamModel
            {
                Link = model.Link,
                UrlImagen = model.UrlImagen,
                Duracion = TimeSpan.FromMinutes(model.Duracion),
            });
            return Ok(new ApiResponse("RozPam reado"));
        }

        public async Task<ActionResult> EliminarSpam(SpamModel spam)
        {
            await spamService.Remover(spam.Id);
            return Ok(new ApiResponse("RozPam Removido"));
        }

        [HttpPost]
        public async Task<ActionResult> CrearCodigoPremium(CodigoPremiumViewModel codigoPremiumVM)
        {
            if (codigoPremiumVM.Expiracion < DateTimeOffset.Now)
            {
                ModelState.AddModelError("Expiración", "Tiene que ser en el futuro padre");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var cp = await CrearCP(codigoPremiumVM);
            return Json(new { cp = cp.Id });
        }

        private async Task<CodigoPremiumModel> CrearCP(CodigoPremiumViewModel codigoPremiumVM)
        {
            var cp = new CodigoPremiumModel();
            cp.Id = hashService.Random(40);
            cp.Tipo = codigoPremiumVM.Tipo;
            cp.Cantidad = codigoPremiumVM.Cantidad;
            cp.Expiracion = codigoPremiumVM.Expiracion;
            cp.Usos = codigoPremiumVM.Usos;
            context.CodigosPremium.Add(cp);
            await context.SaveChangesAsync();
            await premiumService.RegistrarAccionCP(User.GetId(), cp.Id, TipoAccionCP.Creacion);
            return cp;
        }

        public async Task<ActionResult> CheckearCodigoPremium(string id)
        {
            var codigoPremium = await context.CodigosPremium.FirstOrDefaultAsync(c => c.Id == id);
            if (codigoPremium is null)
            {
                ModelState.AddModelError("CodigoPremium", "No existe");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var historial = await context.AccionesCodigosPremium.Where(a => a.CodigoPremiumId == id).Include(a => a.Usuario).OrderByDescending(a => a.Creacion).ToListAsync();
            return Json(new { cp = codigoPremium, historial });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> AceptarPedido(string id)
        {
            var pedido = await context.Pedidos.Include(p => p.Comprobante).FirstOrDefaultAsync(p => p.Id == id);

            if (pedido is null)
            {
                ModelState.AddModelError("Pedido", "No existe");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (pedido.Estado != PedidoEstado.Pendiente)
            {
                ModelState.AddModelError("Pedido", "Ya fue resuelto");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var codigoPremiumVMRouzCoins = new CodigoPremiumViewModel();
            codigoPremiumVMRouzCoins.Tipo = TipoCP.RouzCoins;
            codigoPremiumVMRouzCoins.Usos = 1;
            codigoPremiumVMRouzCoins.Expiracion = DateTimeOffset.Now + TimeSpan.FromDays(365);

            var rcOpt = rouzCoinsOpts.Value.FirstOrDefault(rc => rc.Id == pedido.Paquete);
            codigoPremiumVMRouzCoins.Cantidad = rcOpt.Cantidad;

            var cpRouzCoins = await CrearCP(codigoPremiumVMRouzCoins);
            pedido.CodigoPaquete = cpRouzCoins;

            if (pedido.Tipo == TipoCP.ActivacionPremium)
            {
                var codigoPremiumVMActivacion = new CodigoPremiumViewModel();
                codigoPremiumVMActivacion.Tipo = TipoCP.ActivacionPremium;
                codigoPremiumVMActivacion.Usos = 1;
                codigoPremiumVMActivacion.Expiracion = DateTimeOffset.Now + TimeSpan.FromDays(365);

                var memOps = membreciaOpts.Value.FirstOrDefault(rc => rc.Id == pedido.Paquete);
                codigoPremiumVMActivacion.Cantidad = memOps.Cantidad;

                var cpActivacion = await CrearCP(codigoPremiumVMActivacion);
                pedido.CodigoMembrecia = cpActivacion;
            }
            pedido.Estado = PedidoEstado.Aceptado;
            if (!(pedido.Comprobante is null))
            {
                var eliminado = await premiumService.EliminarComprobante(pedido.Comprobante);
                if (eliminado)
                {
                    context.Remove(pedido.Comprobante);
                }
            }
            await context.SaveChangesAsync();
            return new ApiResponse("Pedido aceptado");
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> RechazarPedido(string id)
        {
            var pedido = await context.Pedidos.Include(p => p.Comprobante).FirstOrDefaultAsync(p => p.Id == id);

            if (pedido is null)
            {
                ModelState.AddModelError("Pedido", "No existe");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (pedido.Estado != PedidoEstado.Pendiente)
            {
                ModelState.AddModelError("Pedido", "Ya fue resuelto");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            pedido.Estado = PedidoEstado.Rechazado;
            if (!(pedido.Comprobante is null))
            {
                var eliminado = await premiumService.EliminarComprobante(pedido.Comprobante);
                if (eliminado)
                {
                    context.Remove(pedido.Comprobante);
                }
            }
            await context.SaveChangesAsync();
            return new ApiResponse("Pedido rechazado");
        }

        [Route("/Direccion/PedidosAceptados")]
        public async Task<ActionResult> PedidosAceptados()
        {
            var pedidos = await context.Pedidos.Where(p => p.Estado == PedidoEstado.Aceptado).Include(p => p.Usuario).OrderByDescending(p => p.Creacion).ToListAsync();
            return View(new { pedidos, propio = false });
        }
        [Route("/Direccion/ListaDePremiums")]
        public async Task<ActionResult> ListaDePremiums()
        {
            var ahora = DateTimeOffset.Now;
            var premiums = await context.Balances.Include(b => b.Usuario).Where(b => b.Expiracion > ahora).OrderBy(b => b.Expiracion).ToListAsync();
            return View(new { premiums });
        }
        [HttpPost]
        public async Task<ActionResult<ApiResponse>> CalcularTotalSize()
        {
            var n = await mediaService.CalcularTotalSize();
            return new ApiResponse($"{n}");
        }

    }
}

public class DireccionVM
{
    public UsuarioVM[] Devs { get; set; }
    public UsuarioVM[] Directores { get; set; }
    public List<PedidoCodigoPremiumModel> Pedidos { get; set; }
    public List<BalanceModel> Premiums { get; set; }
}