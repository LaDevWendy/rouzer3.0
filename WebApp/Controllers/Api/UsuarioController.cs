using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore;
using Microsoft.Extensions.Logging;
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

namespace WebApp.Controllers
{
    [ApiController, Route("api/Usuario/{action}/{id?}")]
    public class UsuarioController : Controller
    {
        private readonly UserManager<UsuarioModel> userManager;
        private readonly SignInManager<UsuarioModel> signInManager;
        private readonly CaptchaService captcha;
        private readonly IOptionsSnapshot<GeneralOptions> generalOptions;

        #region constructor
        public UsuarioController(
            UserManager<UsuarioModel> userManager,
            SignInManager<UsuarioModel> signInManager,
            CaptchaService captcha,
            IOptionsSnapshot<GeneralOptions> generalOptions
        )
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.captcha = captcha;
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

            UsuarioModel user = new UsuarioModel
            {
                UserName = model.Nick,
                Creacion = DateTimeOffset.Now
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
        public async Task<ActionResult> Login() 
        {
            return View("Login");
        }

        [HttpGet, Route("/Registro")]
        public async Task<ActionResult> Registro() 
        {
            return View("Registro");
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

            var result = await signInManager.PasswordSignInAsync(user, model.Contraseña, true, false);
            ModelState.AddModelError("Contraseña","La constraseña es incorrecta");
            if(result.Succeeded) return  Ok(new ApiResponse("Logeadito"));
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
    }
}