using Microsoft.AspNetCore.Mvc;
using Servicios;
using System.Collections.Generic;
using Modelos;
using System.Threading.Tasks;
using System.Net;
using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Data;
using WebApp.Otros;
using System.Security.Claims;

namespace WebApp.Controllers
{
    [ApiController, Route("api/Usuario/{action}/{id?}")]
    public class UsuarioController : Controller
    {
        private readonly UserManager<UsuarioModel> userManager;
        private readonly SignInManager<UsuarioModel> signInManager;
        private readonly CaptchaService captcha;
        private readonly RChanContext context;
        private readonly HashService hashService;
        private readonly IOptionsSnapshot<GeneralOptions> generalOptions;

        #region constructor
        public UsuarioController(
            UserManager<UsuarioModel> userManager,
            SignInManager<UsuarioModel> signInManager,
            CaptchaService captcha,
            IOptionsSnapshot<GeneralOptions> generalOptions,
            RChanContext context,
            HashService hashService
        )
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.captcha = captcha;
            this.context = context;
            this.hashService = hashService;
            this.generalOptions = generalOptions;
        }
        #endregion

        // [HttpPost]
        // public async Task<ActionResult<Controllers.ApiResponse>> CrearAnonimo()
        // {
        //     var (usuarioResult, id) = await usuarioService.GenerarUsuarioAnonimo();
        //     if(usuarioResult.Succeeded) 
        //     {
        //         bool logueado = await usuarioService.LoguearUsuarioAnonimo(id);
        //         if(logueado)
        //         {
        //             return new ApiResponse("logueado", true, id);

        //         }
        //     }
        //     return new ApiResponse("error", false, usuarioResult.Errors);
        // }
        [HttpPost]
        public async Task<ActionResult> Registro(RegistroVM model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (await userManager.Users.AnyAsync(u => u.UserName == model.Nick))
            {
                ModelState.AddModelError("Nick", "El nombre de usuario ya existe");
            }
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var res = await CheckeosRegistro(model.Captcha, model.Codigo);

            if (res != null) return res;

            UsuarioModel user = new UsuarioModel
            {
                UserName = model.Nick,
                Creacion = DateTimeOffset.Now,
                Ip = HttpContext.GetIp(),
                FingerPrint = model.FingerPrint
            };
            var createResult = await userManager.CreateAsync(user, model.Contraseña);

            if (createResult.Succeeded)
            {
                await signInManager.SignInAsync(user, true);
                return this.RedirectJson("/");

            }
            else
            {
                return BadRequest(createResult.Errors);
            }
        }

        [HttpPost]
        public async Task<ActionResult> Inicio(InicioVM model)
        {
            var res = await CheckeosRegistro(model.Captcha, model.Codigo);
            if (res != null) return res;

            UsuarioModel user = new UsuarioModel
            {
                UserName = "Anon." + hashService.Random(12),
                Creacion = DateTimeOffset.Now,
                Ip = HttpContext.GetIp(),
                FingerPrint = model.FingerPrint
            };
            user.Token = hashService.Random(40);
            var createResult = await userManager.CreateAsync(user);

            await userManager.AddClaimAsync(user, new Claim("Token", user.Token));

            if (createResult.Succeeded)
            {
                await signInManager.SignInAsync(user, true);
                return this.RedirectJson($"/Token?token={user.Token}");

            }
            else
            {
                return BadRequest(createResult.Errors);
            }
        }

        private async Task<ActionResult> CheckeosRegistro(string captcha, string codigo)
        {
            var pasoElCaptcha = await this.captcha.Verificar(captcha);

            if (!pasoElCaptcha && generalOptions.Value.CaptchaRegistro)
            {
                ModelState.AddModelError("Captcha", "Incorrecto");
            }
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (!generalOptions.Value.RegistroAbierto)
            {
                if (string.IsNullOrWhiteSpace(codigo))
                {
                    ModelState.AddModelError("Uy!", "El registro y los inicios de sesion se encuentran deshabilitados por el momento");
                }
                else if (codigo != generalOptions.Value.LinkDeInvitacion)
                {
                    ModelState.AddModelError("Uy!", "Codigo invalido");
                }
            }

            if (!ModelState.IsValid) return BadRequest(ModelState);

            string ip = HttpContext.GetIp();

            var banActivo = await context.Bans.BansActivos(User.GetId(), ip).FirstOrDefaultAsync();
            if (banActivo != null)
            {
                return this.RedirectJson($"/Domado/{banActivo.Id}");
                // ModelState.AddModelError("Uff", "Esta ip esta baneada, no te podes registrar");
                // if(!ModelState.IsValid) return BadRequest(ModelState);
            }

            // Checkear cuentas creadas desde esa ip
            var unaSemanaAntes = DateTimeOffset.Now - TimeSpan.FromDays(7);
            int registrosPrevios = await context.Usuarios.CountAsync(u => u.Ip == ip && u.Creacion > unaSemanaAntes);
            if (registrosPrevios >= generalOptions.Value.NumeroMaximoDeCuentasPorIp)
            {
                ModelState.AddModelError("Jijo de buta", "Llegaste al numero maximo de sesiones/registros por ip");
                if (!ModelState.IsValid) return BadRequest(ModelState);
            }

            return null;
        }

        [HttpGet, Route("/Login")]
        public ActionResult Login()
        {
            return View("Login");
        }

        [HttpGet, Route("/Registro")]
        public ActionResult Registro(string codigoDeInvitacion)
        {
            return View("Registro", new { codigoDeInvitacion });
        }

        [HttpGet, Route("/Token")]
        public async Task<ActionResult> Token(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                if (!User.Identity.IsAuthenticated) return Redirect("/Inicio");
                token = (await userManager.GetUserAsync(User)).Token;
            }
            return View("Token", new { token });
        }

        public class RestaurarSesionVm
        {
            public string Token { get; set; }
            public string FingerPrint { get; set; }
        }
        [HttpPost]
        public async Task<ActionResult> RestaurarSesion(RestaurarSesionVm model)
        {
            if (model.Token.Length < 20) ModelState.AddModelError("Jijo", "Token invalido");
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var user = await userManager.Users.FirstOrDefaultAsync(u => u.Token == model.Token);
            if (user == null) ModelState.AddModelError("Jijo", "Token invalido");
            if (!ModelState.IsValid) return BadRequest(ModelState);


            //Checkeo ban
            string ip = HttpContext.GetIp();
            var ban = (await context.Bans
                .Where(b => b.UsuarioId == user.Id || b.Ip == ip)
                .ToListAsync())
                .FirstOrDefault(b => b.Expiracion > DateTimeOffset.Now);

            if (ban != null) return this.RedirectJson($"/Domado/{ban.Id}");

            await signInManager.SignInAsync(user, true);
            return this.RedirectJson("/");
        }
        [HttpGet, Route("/Inicio")]
        public ActionResult Inicio(string codigoDeInvitacion)
        {
            return View("Inicio", new { codigoDeInvitacion });
        }
        [HttpGet, Route("/Domado/{id?}")]
        public async Task<ActionResult> Domado(string id)
        {
            string ip = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();

            BaneoModel ban;
            if (!string.IsNullOrWhiteSpace(id))
            {
                ban = await context.Bans
                    .OrderByDescending(b => b.Expiracion)
                    .Include(b => b.Hilo)
                    .Include(b => b.Comentario)
                    .FirstOrDefaultAsync(b => b.Id == id);
            }
            else
            {
                ban = await context.Bans.OrderByDescending(b => b.Expiracion).Include(b => b.Hilo).Include(b => b.Comentario).FirstOrDefaultAsync(b => b.UsuarioId == User.GetId() || b.Ip == ip);
            }

            if (ban is null) return Redirect("/");

            var bans = await context.Bans
                    .Where(b => b.UsuarioId == User.GetId() || b.Ip == ip)
                    .ToListAsync();
            bans.ForEach(b => b.Visto = true);
            ban.Visto = true;
            await context.SaveChangesAsync();

            // await signInManager.SignOutAsync();

            var apelacion = await context.Apelaciones.FirstOrDefaultAsync(a => a.BanId == ban.Id);

            if (apelacion is null)
            {
                return View("Ban", new
                {
                    Ban = new
                    {
                        Hilo = ban?.Hilo?.Titulo ?? " ",
                        ban.Id,
                        ban.Tipo,
                        ban.Creacion,
                        ban.Expiracion,
                        ban.Duracion,
                        Motivo = ban.Motivo.ToString("g"),
                        ban.Aclaracion,
                    }
                });
            }

            return View("Ban", new
            {
                Ban = new
                {
                    Hilo = ban?.Hilo?.Titulo ?? " ",
                    ban.Id,
                    ban.Tipo,
                    ban.Creacion,
                    ban.Expiracion,
                    ban.Duracion,
                    Motivo = ban.Motivo.ToString("g"),
                    ban.Aclaracion,
                },
                Apelacion = new
                {
                    apelacion.Estado,
                    apelacion.Descripcion
                }
            });


        }
        [HttpPost, Authorize, Route("/Domado")]
        public async Task<ActionResult> Apelar(ApelacionVM apelacionVM)
        {
            var ban = await context.Bans.FirstOrDefaultAsync(b => b.Id == apelacionVM.BanId);
            if (ban == null)
            {
                if (ban is null) return Redirect("/Error/404");
            }

            var apelacionVigente = await context.Apelaciones.FirstOrDefaultAsync(a => a.BanId == ban.Id);
            if (apelacionVigente != null)
            {
                ModelState.AddModelError("Basta:", "el ban ya fue apelado.");
                return BadRequest(ModelState);
            }

            var apelacion = new ApelacionModel
            {
                Id = hashService.Random(),
                Creacion = DateTimeOffset.Now,
                Estado = ApelacionEstado.Pendiente,
                BanId = ban.Id,
                UsuarioId = User.GetId(),
                Descripcion = apelacionVM.Descripcion
            };
            context.Apelaciones.Add(apelacion);
            await context.SaveChangesAsync();
            return Json(new ApiResponse("Apelación enviada. Será revisada por la administración."));
        }


        [HttpPost, Route("/Logout")]
        public async Task<ActionResult> Logout()
        {
            await signInManager.SignOutAsync();
            return Redirect("/");
        }

        [HttpPost]
        public async Task<ActionResult> Login(RegistroVM model)
        {
            var user = await userManager.Users.FirstOrDefaultAsync(u => u.UserName == model.Nick);
            if (user == null) ModelState.AddModelError("Nick", "No se encontro el usuario");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var contraseñaCorrecta = (await signInManager.CheckPasswordSignInAsync(user, model.Contraseña, false)).Succeeded;

            if (!contraseñaCorrecta)
            {
                ModelState.AddModelError("Contraseña", "La constraseña es incorrecta");
                return BadRequest(ModelState);
            }

            //Checkeo ban
            string ip = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
            var ban = (await context.Bans
                .Where(b => b.UsuarioId == user.Id || b.Ip == ip)
                .ToListAsync())
                .FirstOrDefault(b => b.Expiracion > DateTimeOffset.Now);

            if (ban != null) return this.RedirectJson($"/Domado/{ban.Id}");
            var result = await signInManager.PasswordSignInAsync(user, model.Contraseña, true, false);
            if (result.Succeeded) return this.RedirectJson("/");

            return BadRequest(ModelState);
        }

        [HttpGet, Route("/MisComentarios")]
        public async Task<ActionResult> MisComentarios()
        {
            var id = User.GetId();
            var Comentarios = await context.Comentarios
                        .AsNoTracking()
                        .Recientes()
                        .DeUsuario(id)
                        .Include(c => c.Hilo)
                        .Where(c => c.Estado == ComentarioEstado.Normal && c.Hilo.Estado != HiloEstado.Eliminado)
                        .AViewModel()
                        .Take(150)
                        .ToListAsync();
            Comentarios.ForEach(c => c.Propio = true);
            return View(new { Comentarios = Comentarios });
        }
    }

    public class RegistroVM
    {
        [MinLength(4, ErrorMessage = "Minimo 4 letras")]
        [Required(ErrorMessage = "Tienes que escribir un nick padre")]
        [MaxLength(30, ErrorMessage = "para la mano")]

        public string Nick { get; set; }
        [MinLength(6, ErrorMessage = "Minimo 6 letras")]
        [Required(ErrorMessage = "Contraseña requerida")]
        [MaxLength(30, ErrorMessage = "para la mano")]
        public string Contraseña { get; set; }
        public string FingerPrint { get; set; }
        public string Captcha { get; set; }

        public string Codigo { get; set; }
    }
    public class InicioVM
    {
        public string Captcha { get; set; }
        public string Codigo { get; set; }
        public string FingerPrint { get; set; }
    }

    public class ApelacionVM
    {
        public string BanId { get; set; }
        [Required(ErrorMessage = "Debe desarrollar su apelación")]
        [MaxLength(280, ErrorMessage = "280 caracteres como máximo")]
        public string Descripcion { get; set; }
    }

    public static class ControllerExtensions
    {
        public static ActionResult RedirectJson(this Controller controller, string path)
        {
            return controller.Json(new
            {
                Redirect = path
            });
        }
    }
}