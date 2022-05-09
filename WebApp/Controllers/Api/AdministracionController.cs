using Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Modelos;
using Servicios;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using WebApp;
using static WebApp.RChanHub;

namespace WebApp.Controllers
{
    [Authorize("esAdmin")]
    [ApiController, Route("api/Administracion/{action}/{id?}")]
    public class Administracion : Controller
    {
        private readonly IHiloService hiloService;
        private readonly IMediaService mediaService;
        private readonly HashService hashService;
        private readonly IHubContext<RChanHub> rchanHub;
        private readonly RChanContext context;
        private readonly UserManager<UsuarioModel> userManager;
        private readonly SignInManager<UsuarioModel> signInManager;
        private readonly IOptions<GeneralOptions> config;
        private readonly IOptionsSnapshot<List<Categoria>> categoriasOpt;
        private readonly SpamService spamService;


        public Administracion(
            IHiloService hiloService,
            IMediaService mediaService,
            HashService hashService,
            IHubContext<RChanHub> rchanHub,
            RChanContext context,
            UserManager<UsuarioModel> userManager,
            SignInManager<UsuarioModel> signInManager,
            IOptionsSnapshot<GeneralOptions> config,
            IOptionsSnapshot<List<Categoria>> categoriasOpt,
            SpamService spamService
        )
        {
            this.hiloService = hiloService;
            this.mediaService = mediaService;
            this.hashService = hashService;
            this.rchanHub = rchanHub;
            this.context = context;
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.config = config;
            this.categoriasOpt = categoriasOpt;
            this.spamService = spamService;
        }
        [Route("/Administracion")]
        public async Task<ActionResult> Index()
        {
            var deveps = await userManager.GetUsersForClaimAsync(new Claim("Role", "dev"));
            var admins = await userManager.GetUsersForClaimAsync(new Claim("Role", "admin"));
            var mods = await userManager.GetUsersForClaimAsync(new Claim("Role", "mod"));
            var auxiliares = await userManager.GetUsersForClaimAsync(new Claim("Role", "auxiliar"));

            var devs = deveps.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToArray();
            var adms = admins.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToArray();
            var meds = mods.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToArray();
            var auxs = auxiliares.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToArray();

            var vm = new AdministracionVM
            {
                Devs = devs,
                Admins = adms,
                Mods = meds,
                Auxiliares = auxs,
                Config = config.Value
            };
            return View(vm);
        }

        [HttpPost]
        public async Task<ActionResult> ActualizarConfiguracion(GeneralOptions config, [FromServices] IWebHostEnvironment host)
        {
            await config.Guardar(Path.Combine(host.ContentRootPath, "generalsettings.json"));

            // Juntar con el layout
            await rchanHub.Clients.Groups("rozed").SendAsync("configuracionActualizada", new
            {
                config.TiempoEntreComentarios,
                config.TiempoEntreHilos,
                config.LimiteArchivo,
                config.RegistroAbierto,
                config.CaptchaHilo,
                config.CaptchaComentario,
                config.CaptchaRegistro,
                config.Version,
                config.ModoMessi,
                config.ModoSerenito,
                config.Flags,
                config.PalabrasCensuradas,
                config.ProhibirVPNs,
                config.TiempoDeEspera
            });

            return Json(new ApiResponse("Configuracion actualizada"));
        }

        [HttpPost]
        public async Task<ActionResult> GenerarNuevoLinkDeInvitacion([FromServices] IWebHostEnvironment host)
        {
            string link = hashService.Random(8);
            config.Value.LinkDeInvitacion = link;
            await config.Value.Guardar(Path.Combine(host.ContentRootPath, "generalsettings.json"));
            return Json(new { Link = link });
        }

        public class RolUserVM
        {
            public string Username { get; set; }
            public string Role { get; set; }
        }
        [HttpPost]
        public async Task<ActionResult> AñadirRol(RolUserVM model)
        {
            var role = model.Role;
            var username = model.Username;

            if (!new[] { "dev", "admin", "mod", "auxiliar" }.Contains(role))
                ModelState.AddModelError("Rol", "Rol invalido");


            var user = await userManager.Users.FirstOrDefaultAsync(u => u.UserName == username || u.Id == username);
            if (user is null)
                ModelState.AddModelError("userName", "No se encontre al usuario");
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            bool yaTieneElRol = (await userManager.GetClaimsAsync(user)).FirstOrDefault(c => c.Type == "Role") != null;

            if (yaTieneElRol)
            {
                ModelState.AddModelError("", "El usuario ya tiene ese rol");
                return BadRequest(ModelState);
            }

            var result = await userManager.AddClaimAsync(user, new Claim("Role", role));
            if (result.Succeeded)
            {
                return Json(new ApiResponse($"{user.UserName} ahora es {role}"));
            }
            else
                return BadRequest(result.Errors);
        }

        public async Task<ActionResult> RefrescarOnlines()
        {
            var devs = await userManager.GetUsersForClaimAsync(new Claim("Role", "dev"));
            var admins = await userManager.GetUsersForClaimAsync(new Claim("Role", "admin"));
            var mods = await userManager.GetUsersForClaimAsync(new Claim("Role", "mod"));
            var auxiliares = await userManager.GetUsersForClaimAsync(new Claim("Role", "auxiliar"));
            List<UsuarioVM> staff = devs.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToList();
            staff.AddRange(admins.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToList());
            staff.AddRange(mods.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToList());
            staff.AddRange(auxiliares.Select(u => new UsuarioVM { Id = u.Id, UserName = u.UserName }).ToList());

            ConcurrentDictionary<string, OnlineUser> usuariosConectados = NombresUsuariosConectados;
            Dictionary<string, OnlineUser> onlines = new Dictionary<string, OnlineUser>();

            var keys = usuariosConectados.Keys.Select(k => k).ToList();
            foreach (UsuarioVM a in staff)
            {
                OnlineUser onlineUser = new OnlineUser();
                onlineUser.NConexiones = 0;
                onlineUser.UltimaConexion = DateTime.MinValue;
                onlineUser = usuariosConectados.GetOrAdd(a.UserName, onlineUser);
                onlines.Add(a.UserName, onlineUser);
                keys.Remove(a.UserName);
            }

            var now = DateTime.Now;
            var timespan = TimeSpan.FromMinutes(10);
            foreach (string k in keys)
            {
                OnlineUser onlineUser;
                if (usuariosConectados.TryGetValue(k, out onlineUser))
                {
                    if ((onlineUser.NConexiones <= 0) && ((DateTime.Now - onlineUser.UltimaConexion) > timespan))
                    {
                        usuariosConectados.TryRemove(k, out var jijo);
                    }
                }

            }
            return Json(onlines);
        }

        public async Task<ActionResult> RemoverRol(RolUserVM model)
        {
            var role = model.Role;
            var username = model.Username;

            if (!new[] { "dev", "admin", "mod", "auxiliar" }.Contains(role))
                ModelState.AddModelError("Rol", "Rol invalido");


            var user = await userManager.Users.FirstOrDefaultAsync(u => u.UserName == username || u.Id == username);
            if (user is null)
                ModelState.AddModelError("userName", "No se encontre al usuario");
            if (!ModelState.IsValid)
                return BadRequest(ModelState);


            var result = await userManager.RemoveClaimAsync(user, new Claim("Role", role));
            if (result.Succeeded)
            {
                // await signInManager.RefreshSignInAsync(user);
                return Json(new ApiResponse($"{user.UserName} ya no es {role}"));
            }
            else
                return BadRequest(result.Errors);
        }

        [Route("/Administracion/CambiarContraseña")]
        public async Task<ActionResult> CambiarContraseña()
        {
            return View();
        }

        [Route("/Administracion/CambiarContraseña"), HttpPost]
        public async Task<ActionResult> CambiarContraseña([FromForm] string contraseñaVieja, [FromForm] string contraseñaNueva)
        {
            var user = await userManager.GetUserAsync(User);
            var result = await userManager.ChangePasswordAsync(user, contraseñaVieja, contraseñaNueva);

            if (result.Succeeded)
            {
                return Redirect("/");
            }
            else
            {
                return View();
            }
        }

        [HttpPost]
        public async Task<ActionResult> LimpiarRozesViejos()
        {
            var dosDiasAtras = DateTimeOffset.Now - TimeSpan.FromDays(2);
            var hilosALimpiar = await context.Hilos
                .Where(h => h.Estado == HiloEstado.Archivado || h.Estado == HiloEstado.Eliminado)
                .Where(h => h.Creacion < dosDiasAtras)
                .ToListAsync();

            foreach (var h in hilosALimpiar)
            {
                await hiloService.LimpiarHilo(h);
            }
            await context.SaveChangesAsync();
            var ArchivosLimpiados = await mediaService.LimpiarMediasHuerfanos();

            return Json(new ApiResponse($"{hilosALimpiar.Count()} hilos limpiados y {ArchivosLimpiados} archivos limpiados"));

        }

        [Route("/Administracion/Spams")]
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

        [Route("/Administracion/Apelaciones")]
        public async Task<ActionResult> Apelaciones()
        {
            var apelacionesPendientes = await context.Apelaciones
                .AsNoTracking()
                .OrderByDescending(a => a.Creacion)
                .Include(a => a.Usuario)
                .Include(a => a.Ban)
                .Include(a => a.Ban).ThenInclude(b => b.Hilo)
                .Include(a => a.Ban).ThenInclude(b => b.Comentario)
                .Include(a => a.Ban).ThenInclude(b => b.Hilo).ThenInclude(h => h.Media)
                .Include(a => a.Ban).ThenInclude(b => b.Comentario).ThenInclude(c => c.Media)
                .Where(a => a.Estado == ApelacionEstado.Pendiente)
                .ToListAsync();

            var apelacionesPendientesVM = apelacionesPendientes.Select(
                a =>
                    new
                    {
                        a.Creacion,
                        a.Id,
                        a.Ban,
                        a.Usuario,
                        a.Descripcion,
                        a.Estado
                    }
            );

            var apelacionesResueltas = await context.Apelaciones
                .AsNoTracking()
                .OrderByDescending(a => a.Creacion)
                .Include(a => a.Usuario)
                .Include(a => a.Ban)
                .Include(a => a.Ban).ThenInclude(b => b.Hilo)
                .Include(a => a.Ban).ThenInclude(b => b.Comentario)
                .Include(a => a.Ban).ThenInclude(b => b.Hilo).ThenInclude(h => h.Media)
                .Include(a => a.Ban).ThenInclude(b => b.Comentario).ThenInclude(c => c.Media)
                .Where(a => a.Estado != ApelacionEstado.Pendiente)
                .Take(100)
                .ToListAsync();

            var apelacionesResueltasVM = apelacionesResueltas.Select(
                a =>
                    new
                    {
                        a.Creacion,
                        a.Id,
                        a.Ban,
                        a.Usuario,
                        a.Descripcion,
                        a.Estado
                    }
            );

            return View(new { ApelacionesPendientes = apelacionesPendientesVM, ApelacionesResueltas = apelacionesResueltasVM });
        }

        [HttpPost]
        public async Task<ActionResult> AceptarApelacion(string id)
        {
            var apelacion = await context.Apelaciones.Include(a => a.Ban).FirstOrDefaultAsync(d => d.Id == id);

            if (apelacion is null)
            {
                ModelState.AddModelError("Apelación", "No se encontro la apelación");
                return BadRequest(ModelState);
            }

            if (apelacion.Estado == ApelacionEstado.Aceptada)
                return Json(new ApiResponse("Apelación aceptada."));
            else if (apelacion.Estado == ApelacionEstado.Rechazada)
                return Json(new ApiResponse("No se puede aceptar una apelación rechazada"));

            apelacion.Estado = ApelacionEstado.Aceptada;

            var ahora = DateTimeOffset.Now;
            if (apelacion.Ban.Expiracion > ahora)
            {
                apelacion.Ban.Expiracion = DateTimeOffset.Now;
            }

            await context.SaveChangesAsync();

            return Json(new ApiResponse("Apelación aceptada"));
        }

        [HttpPost]
        public async Task<ActionResult> RechazarApelacion(string id)
        {
            var apelacion = await context.Apelaciones.Include(a => a.Ban).FirstOrDefaultAsync(d => d.Id == id);

            if (apelacion is null)
            {
                ModelState.AddModelError("Apelación", "No se encontro la apelación");
                return BadRequest(ModelState);
            }

            if (apelacion.Estado == ApelacionEstado.Rechazada)
                return Json(new ApiResponse("Apelación rechazada."));
            else if (apelacion.Estado == ApelacionEstado.Aceptada)
                return Json(new ApiResponse("No se puede rechazar una apelación aceptada"));

            apelacion.Estado = ApelacionEstado.Rechazada;

            await context.SaveChangesAsync();

            return Json(new ApiResponse("Apelación rechazada"));
        }

        [HttpPost]
        public async Task<ActionResult> AñadirFlag(FlagVM fvm)
        {
            var hilo = await context.Hilos.FirstOrDefaultAsync(h => h.Id == fvm.HiloId);
            if (hilo is null)
            {
                ModelState.AddModelError("Hilo", "No se encontro el hilo");
                return BadRequest(ModelState);
            }

            string estado = "";
            if (hilo.Flags.Contains(FlagString(fvm.Flag)))
            {
                hilo.Flags = hilo.Flags.Replace(FlagString(fvm.Flag), "");
                estado = "quitada";
            }
            else
            {
                hilo.Flags += FlagString(fvm.Flag);
                estado = "agregada";
            }

            await context.SaveChangesAsync();
            return Json(new ApiResponse($"Flag {estado}"));
        }

        private string FlagString(FlagCodigo fc)
        {
            switch (fc)
            {
                case FlagCodigo.Banderitas:
                    return "b";
                case FlagCodigo.Concentracion:
                    return "c";
                case FlagCodigo.Dados:
                    return "d";
                case FlagCodigo.IdUnico:
                    return "i";
                case FlagCodigo.Maximo:
                    return "x";
                case FlagCodigo.Serio:
                    return "s";
                case FlagCodigo.Spoiler:
                    return "p";
                default:
                    return "";
            }
        }

    }
}

public class AdministracionVM
{
    public UsuarioVM[] Devs { get; set; }
    public UsuarioVM[] Admins { get; set; }
    public UsuarioVM[] Mods { get; set; }
    public UsuarioVM[] Auxiliares { get; set; }
    public GeneralOptions Config { get; internal set; }
}

public class UsuarioVM
{
    public string Id { get; set; }
    public string UserName { get; set; }
}
public class CrearSpamVM
{
    public string Link { get; set; }
    public string UrlImagen { get; set; }
    [Required]
    public int Duracion { get; set; }
}

public class FlagVM
{
    public string HiloId { get; set; }
    public FlagCodigo Flag { get; set; }
}

public enum FlagCodigo
{
    Banderitas,
    Concentracion,
    Dados,
    IdUnico,
    Maximo,
    Serio,
    Spoiler
}