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

        public PremiumController(HashService hashService, RChanContext context, PremiumService premiumService, UserManager<UsuarioModel> userManager)
        {
            this.hashService = hashService;
            this.context = context;
            this.premiumService = premiumService;
            this.userManager = userManager;
        }

        [Route("/Premium")]
        public async Task<ActionResult> Index()
        {
            var balance = await premiumService.ObtenerBalanceAsync(User.GetId());

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

            return View(new { balance = new { balance.Balance, balance.Expiracion }, transacciones });
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

            if (cp.Expiracion < DateTime.Now)
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

            if (cp.Tipo == TipoCP.ActivacionPremium)
            {
                if (User.EsPremium())
                {
                    ModelState.AddModelError("Premium", "Ya eres premium");
                }
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = await context.Usuarios.FirstOrDefaultAsync(u => u.Id == User.GetId());
                var result = await userManager.AddClaimAsync(user, new Claim("Premium", "gold"));
                if (result.Succeeded)
                {
                    var balance = await premiumService.ObtenerBalanceAsync(User.GetId());
                    balance.Expiracion = DateTime.Now + TimeSpan.FromDays(cp.Cantidad);
                    cp.Usos -= 1;
                    await context.SaveChangesAsync();

                    await premiumService.RegistrarAccionCP(User.GetId(), cp.Id, TipoAccionCP.Uso);
                    await premiumService.RegistrarActivacionAsync(User.GetId(), cp.Cantidad);
                    return Json(new { tipo = cp.Tipo, cantidad = cp.Cantidad, usos = cp.Usos, expiracion = cp.Expiracion });
                }
                else
                {
                    return BadRequest(result.Errors);
                }
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

            var hilo = await context.Hilos.FirstOrDefaultAsync(h => h.Id == donacionVM.HiloId);
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

            await context.SaveChangesAsync();
            await premiumService.RegistrarDonacionAsync(User.GetId(), hilo.UsuarioId, donacionVM.Cantidad, balanceDonante.Balance, balanceReceptor.Balance);
            return new ApiResponse("Donación exitosa");
        }

        [HttpPost, Authorize("esPremium")]
        public async Task<ActionResult<ApiResponse>> AutoBumpear(string hiloId)
        {
            var hilo = await context.Hilos.FirstOrDefaultAsync(h => h.Id == hiloId);
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

            var precioAutobump = 100f;
            var balance = await premiumService.ObtenerBalanceAsync(User.GetId());
            if (balance.Balance < precioAutobump)
            {
                ModelState.AddModelError("Balance", "No tiene la cantidad necesaria en su balance");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var creado = await premiumService.CrearAutoBumpsAsync(User.GetId(), hiloId);
            if (!creado)
            {
                ModelState.AddModelError("AutoBumps", "No pudo crearse");
                return BadRequest(ModelState);
            }
            return new ApiResponse("AutoBump creado.");
        }
    }

    public class DonacionVM
    {
        public string HiloId { get; set; }
        public float Cantidad { get; set; }
    }

}
