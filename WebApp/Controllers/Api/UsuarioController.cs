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

namespace WebApp.Controllers
{
    [ApiController, Route("api/Usuario/{action}/{id?}")]
    public class UsuarioController : Controller
    {
        private readonly UserManager<UsuarioModel> userManager;
        private readonly SignInManager<UsuarioModel> signInManager;
        private readonly CaptchaService captcha;
        private readonly RChanContext context;
        private readonly IOptionsSnapshot<GeneralOptions> generalOptions;

        #region constructor
        public UsuarioController(
            UserManager<UsuarioModel> userManager,
            SignInManager<UsuarioModel> signInManager,
            CaptchaService captcha,
            IOptionsSnapshot<GeneralOptions> generalOptions,
            RChanContext context
        )
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.captcha = captcha;
            this.context = context;
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
        public async Task<ActionResult> Registro( RegistroVM model)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);
            if(await userManager.Users.AnyAsync(u => u.UserName == model.Nick))
            {
                ModelState.AddModelError("Nick", "El nombre de usuario ya existe");
            }
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var pasoElCaptcha= await captcha.Verificar(model.Captcha);

            if(!pasoElCaptcha && generalOptions.Value.CaptchaRegistro)
            {
                ModelState.AddModelError("Captcha", "Incorrecto");
            }
            if(!ModelState.IsValid) return BadRequest(ModelState);

            if(!generalOptions.Value.RegistroAbierto)
            {
                if(string.IsNullOrWhiteSpace(model.Codigo))
                {
                    ModelState.AddModelError("Uy!", "El registro se encuentra cerrado por el momento");
                }
                else if (model.Codigo != generalOptions.Value.LinkDeInvitacion)
                {
                    ModelState.AddModelError("Uy!", "Codigo invalido");
                }
            }

            if(!ModelState.IsValid) return BadRequest(ModelState);

            string ip = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
            if(await context.Bans.EstaBaneado(User.GetId(), ip))
            {
                ModelState.AddModelError("Uff", "Esta ip esta baneada, no te podes registrar");
                if(!ModelState.IsValid) return BadRequest(ModelState);
            }

            // Checkear cuentas creadas desde esa ip
            int registrosPrevios = await context.Usuarios.CountAsync(u => u.Ip == ip);
            if(registrosPrevios >= generalOptions.Value.NumeroMaximoDeCuentasPorIp)
            {
                ModelState.AddModelError("Jijo de buta", "Llegaste al numero maximo de cuentas por ip");
                if(!ModelState.IsValid) return BadRequest(ModelState);
            }

            UsuarioModel user = new UsuarioModel
            {
                UserName = model.Nick,
                Creacion = DateTimeOffset.Now,
                Ip = ip,
            };
            var createResult = await userManager.CreateAsync(user, model.Contraseña);

            if(createResult.Succeeded) 
            {
                await signInManager.SignInAsync(user, true);
                return Redirect("/");

            }
            else {
                return BadRequest(createResult.Errors);
            }
        }

        [HttpGet, Route("/Login")]
        public  ActionResult Login() 
        {
            return View("Login");
        }

        [HttpGet, Route("/Registro")]
        public  ActionResult Registro(string codigoDeInvitacion) 
        {
            return View("Registro", new {codigoDeInvitacion});
        }
        [HttpGet, Route("/Domado/{id?}")]
        public  async Task<ActionResult> Domado(string id) 
        {
            string ip = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
            var ban = await context.Bans
                .OrderByDescending(b => b.Expiracion)
                .Where(b => !b.Visto)
                .Include(b => b.Hilo)
                .Include(b => b.Comentario)
                .FirstOrDefaultAsync(b => b.UsuarioId == User.GetId() || b.Ip == ip);

            if(ban is null && !string.IsNullOrWhiteSpace(id)) 
            {
                ban = await context.Bans
                    .Include(b => b.Hilo)
                    .FirstOrDefaultAsync(b => b.Id == id);
            }

            if(ban is null) return Redirect("/");
            
            ban.Visto = true;
            await context.SaveChangesAsync();

            // await signInManager.SignOutAsync();
            
            return View("Ban", new {Ban = new {
                Hilo = ban?.Hilo?.Titulo ?? " ",
                ban.Id,
                ban.Tipo,
                ban.Creacion,
                ban.Expiracion,
                ban.Duracion,
                Motivo = ban.Motivo.ToString("g"),
                ban.Aclaracion,
            }});
        }
        
        [HttpPost, Route("/Logout")]
        public async Task<ActionResult> Logout() 
        {
            await signInManager.SignOutAsync();
            return Redirect("/");
        }

        [HttpPost]
        public async Task<ActionResult> Login( RegistroVM model)
        {
            var user = await userManager.Users.FirstOrDefaultAsync(u => u.UserName == model.Nick);
            if(user == null) ModelState.AddModelError("Nick", "No se encontro el usuario");
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var contraseñaCorrecta= (await signInManager.CheckPasswordSignInAsync(user, model.Contraseña, false)).Succeeded;

            if(!contraseñaCorrecta) 
            { 
                ModelState.AddModelError("Contraseña","La constraseña es incorrecta");
                return BadRequest(ModelState);
            }

            //Checkeo ban
            string ip = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
            var ban =  (await context.Bans
                .Where(b => b.UsuarioId == user.Id || b.Ip == ip)
                .ToListAsync())
                .FirstOrDefault(b => b.Expiracion > DateTimeOffset.Now);

            if(ban != null) return this.RedirectJson($"/Domado/{ban.Id}");

            var result = await signInManager.PasswordSignInAsync(user, model.Contraseña, true, false);
            if(result.Succeeded) return this.RedirectJson("/");
        
            return BadRequest(ModelState);
        }
    }
    
    public class RegistroVM
    {
        [MinLength(4, ErrorMessage="Minimo 4 letras")]
        [Required(ErrorMessage="Tienes que escribir un nick padre")]
        [MaxLength(30, ErrorMessage="para la mano")]

        public string Nick { get; set; }
        [MinLength(6, ErrorMessage="Minimo 6 letras")]
        [Required(ErrorMessage="Contraseña requerida")]
        [MaxLength(30, ErrorMessage="para la mano")]
        public string Contraseña { get; set; }
        public string Captcha { get; set; }

        public string Codigo { get; set; }
    }

    public static class  ControllerExtensions 
    {
        public static ActionResult RedirectJson(this Controller controller, string path)
        {
            return controller.Json(new {
                Redirect = path
            });
        }
    }
}