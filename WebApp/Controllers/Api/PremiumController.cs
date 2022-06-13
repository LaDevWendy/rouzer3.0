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

            var transacciones = await context.Transacciones.Where(t => t.UsuarioId == User.GetId()).Select(t => new
            {
                t.Creacion,
                t.OrigenCantidad,
                t.OrigenUnidad,
                t.DestinoCantidad,
                t.DestinoUnidad,
                t.Tipo,
                t.Balance
            }).ToListAsync();

            return View(new { balance = balance.Balance, transacciones });
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
                    cp.Usos -= 1;
                    await context.SaveChangesAsync();
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
                return Json(new { tipo = cp.Tipo, cantidad = cp.Cantidad, usos = cp.Usos, expiracion = cp.Expiracion });
            }

            ModelState.AddModelError("TipoCP", "Tipo de código premium inválido");
            return BadRequest(ModelState);
        }

    }
}
