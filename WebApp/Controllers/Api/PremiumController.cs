using Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Modelos;
using Servicios;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace WebApp.Controllers
{
    [Authorize]
    [ApiController, Route("api/Premium/{action}/{id?}")]
    public class PremiumController : Controller
    {
        private readonly HashService hashService;
        private readonly RChanContext context;
        private readonly PremiumService premiumService;
        private readonly UserManager<UsuarioModel> userManager;
        private readonly IOptionsSnapshot<List<AutoBump>> abOpts;
        private readonly IOptionsSnapshot<List<MensajeGlobal>> mgOpts;
        private readonly IOptionsSnapshot<List<Membrecia>> memOpts;
        private readonly IOptionsSnapshot<List<RouzCoin>> rcOpts;
        private readonly IOptionsSnapshot<List<MetodoDePago>> mpOpts;
        private readonly NotificacionesService notificacionesService;
        private const string comprobanteNulo = "wwwroot/imagenes/noexiste.png";

        public PremiumController(HashService hashService,
            RChanContext context,
            PremiumService premiumService,
            UserManager<UsuarioModel> userManager,
            IOptionsSnapshot<List<MensajeGlobal>> mgOpts,
            IOptionsSnapshot<List<AutoBump>> abOpts,
            IOptionsSnapshot<List<Membrecia>> memOpts,
            IOptionsSnapshot<List<RouzCoin>> rcOpts,
            IOptionsSnapshot<List<MetodoDePago>> mpOpts,
            NotificacionesService notificacionesService)
        {
            this.hashService = hashService;
            this.context = context;
            this.premiumService = premiumService;
            this.userManager = userManager;
            this.mgOpts = mgOpts;
            this.abOpts = abOpts;
            this.notificacionesService = notificacionesService;
            this.memOpts = memOpts;
            this.rcOpts = rcOpts;
            this.mpOpts = mpOpts;
        }

        [Route("/Premium")]
        public async Task<ActionResult> Index()
        {
            var balance = await premiumService.ObtenerBalanceAsync(User.GetId());

            var pedidos = await context.Pedidos.Where(p => p.UsuarioId == User.GetId()).OrderByDescending(p => p.Creacion).Take(5).Select(p => new
            {
                p.Id,
                p.Creacion,
                p.Tipo,
                p.Paquete,
                p.Metodo,
                p.Estado,
                p.CodigoMembreciaId,
                p.CodigoPaqueteId,
                p.ComprobanteId
            }).ToListAsync();

            var transacciones = await context.Transacciones.Where(t => t.UsuarioId == User.GetId()).OrderByDescending(t => t.Creacion).Take(25).Select(t => new
            {
                t.Creacion,
                t.OrigenCantidad,
                t.OrigenUnidad,
                t.DestinoCantidad,
                t.DestinoUnidad,
                t.Tipo,
                t.Balance
            }).ToListAsync();

            return View(new { balance = new { balance.Balance, balance.Expiracion }, pedidos, transacciones, propio = true });
        }

        [HttpPost]
        public async Task<ActionResult> IngresarCodigoPremium(string id)
        {
            var cp = await context.CodigosPremium.FirstOrDefaultAsync(c => c.Id == id);

            if (cp is null)
            {
                ModelState.AddModelError("Null", "Ese código no existe");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (cp.Expiracion < DateTimeOffset.Now)
            {
                ModelState.AddModelError("Expiración", "El código ha expirado");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (cp.Usos < 1)
            {
                ModelState.AddModelError("Usos", "El código no tiene más usos");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var acp = await context.AccionesCodigosPremium.FirstOrDefaultAsync(acp => acp.CodigoPremiumId == cp.Id && acp.Tipo == TipoAccionCP.Uso && acp.UsuarioId == User.GetId());
            if (!(acp is null))
            {
                ModelState.AddModelError("Error", "Ya usaste este código");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (cp.Tipo == TipoCP.ActivacionPremium)
            {
                if (User.EsPremium())
                {
                    var balance = await premiumService.ObtenerBalanceAsync(User.GetId());
                    balance.Expiracion += TimeSpan.FromDays(cp.Cantidad);

                }
                else
                {
                    var user = await context.Usuarios.FirstOrDefaultAsync(u => u.Id == User.GetId());
                    var result = await userManager.AddClaimAsync(user, new Claim("Premium", "gold"));
                    if (result.Succeeded)
                    {
                        var balance = await premiumService.ObtenerBalanceAsync(User.GetId());
                        balance.Expiracion = DateTimeOffset.Now + TimeSpan.FromDays(cp.Cantidad);
                    }
                    else
                    {
                        return BadRequest(result.Errors);
                    }
                }
                cp.Usos -= 1;
                await context.SaveChangesAsync();

                await premiumService.RegistrarAccionCP(User.GetId(), cp.Id, TipoAccionCP.Uso);
                await premiumService.RegistrarActivacionAsync(User.GetId(), cp.Cantidad);
                return Json(new { tipo = cp.Tipo, cantidad = cp.Cantidad, usos = cp.Usos, expiracion = cp.Expiracion });
            }

            if (cp.Tipo == TipoCP.RouzCoins)
            {
                if (!User.EsPremium())
                {
                    ModelState.AddModelError("Premium", "Para poder agregar RouzCoins debes ser usuario premium");
                }
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var balance = await premiumService.ObtenerBalanceAsync(User.GetId());
                balance.Balance += cp.Cantidad;
                cp.Usos -= 1;
                await context.SaveChangesAsync();

                await premiumService.RegistrarAccionCP(User.GetId(), cp.Id, TipoAccionCP.Uso);
                await premiumService.RegistrarAgregarRouzCoinsAsync(User.GetId(), cp.Cantidad, balance.Balance);
                return Json(new { tipo = cp.Tipo, cantidad = cp.Cantidad, usos = cp.Usos, expiracion = cp.Expiracion });
            }

            ModelState.AddModelError("TipoCP", "Tipo de código premium inválido");
            return BadRequest(ModelState);
        }

        [HttpPost, Authorize("esPremium")]
        public async Task<ActionResult<ApiResponse>> HacerDonacion(DonacionVM donacionVM)
        {
            if (!(donacionVM.Cantidad > 0))
            {
                ModelState.AddModelError("Cantidad", "La cantidad tiene que ser mayor a cero");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var hilo = await context.Hilos.Include(h => h.Media).FirstOrDefaultAsync(h => h.Id == donacionVM.HiloId);
            if (hilo is null)
            {
                ModelState.AddModelError("Hilo", "El hilo no existe");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (User.GetId() == hilo.UsuarioId)
            {
                ModelState.AddModelError("Receptor", "El receptor no puede ser el mismo que el donante");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var receptorPremium = await premiumService.CheckearPremium(hilo.UsuarioId);
            if (!receptorPremium)
            {
                ModelState.AddModelError("Premium", "Para poder donar RouzCoins el receptor debe ser usuario premium");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var balanceDonante = await premiumService.ObtenerBalanceAsync(User.GetId());
            if (balanceDonante.Balance < donacionVM.Cantidad)
            {
                ModelState.AddModelError("Balance", "No tiene la cantidad necesaria en su balance");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var balanceReceptor = await premiumService.ObtenerBalanceAsync(hilo.UsuarioId);
            balanceDonante.Balance -= donacionVM.Cantidad;
            balanceReceptor.Balance += donacionVM.Cantidad;

            var donacion = new DonacionModel
            {
                Id = hashService.Random(),
                HiloId = hilo.Id,
                Cantidad = donacionVM.Cantidad
            };
            context.Donaciones.Add(donacion);

            await context.SaveChangesAsync();
            await premiumService.RegistrarDonacionAsync(User.GetId(), hilo.UsuarioId, donacionVM.Cantidad, balanceDonante.Balance, balanceReceptor.Balance);
            await notificacionesService.NotificarDonacion(hilo);
            return new ApiResponse("Donación exitosa");
        }

        [HttpPost, Authorize("esPremium")]
        public async Task<ActionResult<ApiResponse>> AutoBumpear(string id)
        {
            var hilo = await context.Hilos.FirstOrDefaultAsync(h => h.Id == id);
            if (hilo is null)
            {
                ModelState.AddModelError("Hilo", "El hilo no existe");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (hilo.UsuarioId != User.GetId())
            {
                ModelState.AddModelError("Hilo", "No sos el OP");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (hilo.Estado == HiloEstado.Archivado)
            {
                ModelState.AddModelError("Hilo", "El hilo está archivado");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (hilo.Estado == HiloEstado.Eliminado)
            {
                ModelState.AddModelError("Hilo", "El hilo fue domado");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            const int tier = 0;
            var precioAutobump = abOpts.Value.FirstOrDefault(w => w.Id == tier).Valor;
            var balance = await premiumService.ObtenerBalanceAsync(User.GetId());
            if (balance.Balance < precioAutobump)
            {
                ModelState.AddModelError("Balance", "No tiene la cantidad necesaria en su balance");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var creado = await premiumService.CrearAutoBumpsAsync(User.GetId(), id, tier);
            if (!creado)
            {
                ModelState.AddModelError("AutoBumps", "No pudo crearse");
                return BadRequest(ModelState);
            }
            return new ApiResponse("AutoBump creado.");
        }

        [HttpPost, Authorize("esPremium")]
        public async Task<ActionResult<ApiResponse>> CrearMensajeGlobal(MensajeGlobalVM vm)
        {
            if (string.IsNullOrWhiteSpace(vm.Mensaje))
            {
                ModelState.AddModelError("uy!", "El mensaje global no puede estar vacio padre");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var mgOpt = mgOpts.Value.FirstOrDefault(w => w.Id == vm.Tier);
            if (mgOpt is null)
            {
                ModelState.AddModelError("Tier", "Ese tier no existe");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var precioMg = mgOpt.Valor;
            var balance = await premiumService.ObtenerBalanceAsync(User.GetId());
            if (balance.Balance < precioMg)
            {
                ModelState.AddModelError("Balance", "No tiene la cantidad necesaria en su balance");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var creado = await premiumService.CrearMensajeGlobalAsync(User.GetId(), vm.Mensaje, vm.Tier);
            if (!creado)
            {
                ModelState.AddModelError("MensajeGlobal", "No pudo crearse");
                return BadRequest(ModelState);
            }
            return new ApiResponse("Mensaje Global creado.");
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> PedirCodigoPremium([FromForm] PedidoCodigoPremiumViewModel vm)
        {
            var tienePedidos = await context.Pedidos.Where(p => p.UsuarioId == User.GetId()).Where(p => p.Estado == PedidoEstado.Pendiente).AnyAsync();
            if (tienePedidos)
            {
                ModelState.AddModelError("Pendientes", "Todavía tiene pedidos pendientes");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var paquete = memOpts.Value.FirstOrDefault(mem => mem.Id == vm.Paquete);
            if (paquete is null)
            {
                ModelState.AddModelError("Paquete", "No es válido");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var metodo = mpOpts.Value.FirstOrDefault(mp => mp.Id == vm.Metodo);
            if (metodo is null)
            {
                ModelState.AddModelError("Metodo de pago", "No aceptado");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (vm.Archivo is null)
            {
                ModelState.AddModelError("Comprobante", "Falta el comprobante");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string id = hashService.Random();
            var pedido = new PedidoCodigoPremiumModel
            {
                Id = id,
                UsuarioId = User.GetId(),
                Tipo = vm.Tipo,
                Paquete = vm.Paquete,
                Metodo = vm.Metodo
            };
            context.Pedidos.Add(pedido);
            var comprobante = await premiumService.GuardarComprobante(vm.Archivo);
            pedido.Comprobante = comprobante;
            await context.SaveChangesAsync();

            return new ApiResponse("Pedido registrado");
        }

        [Route("/Mis/Transacciones")]
        public async Task<ActionResult> Transacciones()
        {
            var transacciones = await context.Transacciones.Where(t => t.UsuarioId == User.GetId()).OrderByDescending(t => t.Creacion).Select(t => new
            {
                t.Creacion,
                t.OrigenCantidad,
                t.OrigenUnidad,
                t.DestinoCantidad,
                t.DestinoUnidad,
                t.Tipo,
                t.Balance
            }).ToListAsync();
            return View(new { transacciones });
        }

        [Route("/Mis/Pedidos")]
        public async Task<ActionResult> Pedidos()
        {
            var pedidos = await context.Pedidos.Where(p => p.UsuarioId == User.GetId()).OrderByDescending(p => p.Creacion).Select(p => new
            {
                p.Id,
                p.Creacion,
                p.Tipo,
                p.Paquete,
                p.Metodo,
                p.Estado,
                p.CodigoMembreciaId,
                p.CodigoPaqueteId,
                p.ComprobanteId
            }).ToListAsync();
            return View(new { pedidos, propio = true });
        }

        public async Task<FileStreamResult> ObtenerComprobante(string id)
        {
            var pedido = await context.Pedidos.Include(p => p.Comprobante).FirstOrDefaultAsync(p => p.Id == id);
            if (pedido is null)
            {
                return new FileStreamResult(new FileStream($"{comprobanteNulo}", FileMode.Open), $"image/png");
            }

            if (pedido.UsuarioId != User.GetId() && !User.EsDirector())
            {
                return new FileStreamResult(new FileStream($"{comprobanteNulo}", FileMode.Open), $"image/png");
            }

            var comprobante = pedido.Comprobante;
            if (comprobante is null)
            {
                return new FileStreamResult(new FileStream($"{comprobanteNulo}", FileMode.Open), $"image/png");
            }

            return new FileStreamResult(new FileStream($"{comprobante.Path}", FileMode.Open), $"image/{comprobante.Format}");
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> RetirarPedido(string id)
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
            if (pedido.UsuarioId != User.GetId())
            {
                ModelState.AddModelError("Pedido", "No es tuyo");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            pedido.Estado = PedidoEstado.RechazadoPorUsuario;
            if (!(pedido.Comprobante is null))
            {
                var eliminado = await premiumService.EliminarComprobante(pedido.Comprobante);
                if (eliminado)
                {
                    context.Remove(pedido.Comprobante);
                }
            }
            await context.SaveChangesAsync();
            return new ApiResponse("Pedido retirado");
        }

    }

    public class DonacionVM
    {
        public string HiloId { get; set; }
        public float Cantidad { get; set; }
    }

    public class MensajeGlobalVM
    {
        [MinLength(1, ErrorMessage = "Escribí algo padre"), MaxLength(144, ErrorMessage = "Muy largo padre")]
        public string Mensaje { get; set; }
        public int Tier { get; set; }
    }

}
