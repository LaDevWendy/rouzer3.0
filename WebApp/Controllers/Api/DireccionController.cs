using Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        public DireccionController(UserManager<UsuarioModel> userManager, SpamService spamService, PremiumService premiumService, HashService hashService, RChanContext context)
        {
            this.userManager = userManager;
            this.spamService = spamService;
            this.premiumService = premiumService;
            this.hashService = hashService;
            this.context = context;
        }
        [Route("/Direccion")]
        public async Task<IActionResult> IndexAsync()
        {
            var deveps = await userManager.GetUsersForClaimAsync(new Claim("Role", "dev"));
            var directores = await userManager.GetUsersForClaimAsync(new Claim("Role", "director"));

            var devs = deveps.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToArray();
            var dirs = directores.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToArray();

            var vm = new DireccionVM
            {
                Devs = devs,
                Directores = dirs,
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
            if (codigoPremiumVM.Expiracion < DateTime.Now)
            {
                ModelState.AddModelError("Expiración", "Tiene que ser en el futuro padre");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var cp = new CodigoPremiumModel();
            cp.Id = hashService.Random(40);
            cp.CreadorId = User.GetId();
            cp.Tipo = codigoPremiumVM.Tipo;
            cp.Cantidad = codigoPremiumVM.Cantidad;
            cp.Expiracion = codigoPremiumVM.Expiracion;
            cp.Usos = codigoPremiumVM.Usos;
            context.CodigosPremium.Add(cp);
            await context.SaveChangesAsync();
            return Json(new { cp = cp.Id });
        }

        [HttpPost]
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
            return Json(codigoPremium);
        }

    }
}

public class DireccionVM
{
    public UsuarioVM[] Devs { get; set; }
    public UsuarioVM[] Directores { get; set; }
}