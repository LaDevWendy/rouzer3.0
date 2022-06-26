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
using System.Linq;
using System.Threading.Tasks;
using WebApp;

namespace WebApp.Controllers
{
    [Authorize("esAuxiliar")]
    [ApiController, Route("api/Moderacion/{action}/{id?}")]
    public class Moderacion : Controller
    {
        private readonly IHiloService hiloService;
        private readonly IComentarioService comentarioService;
        private readonly IMediaService mediaService;
        private readonly HashService hashService;
        private readonly IHubContext<RChanHub> rchanHub;
        private readonly RChanContext context;
        private readonly UserManager<UsuarioModel> userManager;
        private readonly SignInManager<UsuarioModel> signInManager;
        private readonly IOptions<GeneralOptions> config;
        private readonly IOptionsSnapshot<List<Categoria>> categoriasOpt;
        private readonly AccionesDeModeracionService historial;
        private readonly IAudioService audioService;
        private readonly PremiumService premiumService;

        public Moderacion(
            IHiloService hiloService,
            IComentarioService comentarioService,
            IMediaService mediaService,
            HashService hashService,
            IHubContext<RChanHub> rchanHub,
            RChanContext context,
            UserManager<UsuarioModel> userManager,
            SignInManager<UsuarioModel> signInManager,
            IOptionsSnapshot<GeneralOptions> config,
            IOptionsSnapshot<List<Categoria>> categoriasOpt,
            AccionesDeModeracionService historial,
            IAudioService audioService,
            PremiumService premiumService
        )
        {
            this.hiloService = hiloService;
            this.comentarioService = comentarioService;
            this.mediaService = mediaService;
            this.hashService = hashService;
            this.rchanHub = rchanHub;
            this.context = context;
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.config = config;
            this.categoriasOpt = categoriasOpt;
            this.historial = historial;
            this.audioService = audioService;
            this.premiumService = premiumService;
        }

        [Route("/Moderacion")]
        public async Task<ActionResult> Index()
        {
            var hilos = await context.Hilos
                .OrderByDescending(h => h.Creacion)
                .AsNoTracking()
                .Take(100)
                .AViewModelMod(context)
                .ToListAsync();

            var comentarios = await context.Comentarios
                .OrderByDescending(c => c.Creacion)
                .AsNoTracking()
                .Take(100)
                .Include(c => c.Media)
                .AViewModelMod()
                .ToListAsync();

            var fecha = DateTimeOffset.Now - TimeSpan.FromDays(1.5);
            var denuncias = await context.Denuncias
                .AsNoTracking()
                .OrderByDescending(d => d.Creacion)
                .Take(100)
                .Include(d => d.Hilo)
                .Include(d => d.Usuario)
                .Include(d => d.Comentario)
                .Include(d => d.Comentario.Media)
                .Include(d => d.Comentario.Audio)
                .Include(d => d.Hilo.Media)
                .Include(d => d.Hilo.Audio)
                .Include(d => d.Hilo.Usuario)
                .Include(d => d.Comentario.Usuario)
                .Where(d => d.Creacion > fecha)
                .ToListAsync();

            var medias = await context.Comentarios
                .AsNoTracking()
                .OrderByDescending(d => d.Creacion)
                .Where(c => c.MediaId != null)
                .Include(c => c.Media)
                .Where(c => c.Media.Tipo != MediaType.Eliminado)
                .Take(50)
                .Select(
                    c =>
                        new ComentarioViewModelMod
                        {
                            HiloId = c.HiloId,
                            UsuarioId = c.UsuarioId,
                            Contenido = c.Contenido,
                            Id = c.Id,
                            Creacion = c.Creacion,
                            Media = c.Media
                        }
                )
                .ToListAsync();

            return View(new { hilos, comentarios, denuncias, medias });
        }

        [Route("/Moderacion/ListaDeUsuarios"), Authorize("esAdmin")]
        public async Task<ActionResult> ListaDeUsuarios()
        {
            var ultimosRegistros = await context.Users
                .OrderByDescending(u => u.Creacion)
                .Take(100)
                .ToListAsync();

            var cantidadDeUsuarios = await context.Users.CountAsync();

            var ahora = DateTimeOffset.Now;
            var ultimosBaneos = await context.Bans
                .OrderByDescending(u => u.Creacion)
                .Include(b => b.Usuario)
                .Include(b => b.Hilo)
                .Include(b => b.Comentario)
                .Include(b => b.Comentario.Media)
                .Include(b => b.Hilo.Media)
                .Where(b => b.Expiracion > ahora)
                .ToListAsync();
            return View(new { ultimosRegistros, ultimosBaneos, cantidadDeUsuarios });
        }

        [HttpGet]
        [Route("/Moderacion/HistorialDeUsuario/{id}"), Authorize("esMod")]
        public async Task<ActionResult> HistorialDeUsuario(string id)
        {
            if ((User.GetId() != "954c1d80-0a87-4e1a-9784-1ffc667c598f") && (id == "168ed417-0555-4302-9049-26096cc01837"))
            {
                return Redirect("/Error/404");
            }
            if ((User.GetId() != "168ed417-0555-4302-9049-26096cc01837") && (id == "954c1d80-0a87-4e1a-9784-1ffc667c598f"))
            {
                return Redirect("/Error/404");
            }
            var usuario = await context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
            if (usuario is null)
                return Redirect("/Error/404");

            bool esPremium = (await userManager.GetClaimsAsync(usuario)).FirstOrDefault(c => c.Type == "Premium") != null;
            return View(
                new
                {
                    Usuario = await context.Usuarios
                        .Select(
                            u =>
                                new
                                {
                                    u.Id,
                                    u.Creacion,
                                    u.UserName,
                                    Rozs = context.Hilos.DeUsuario(id).Count(),
                                    Comentarios = context.Comentarios.DeUsuario(id).Count(),
                                    EsPremium = esPremium
                                }
                        )
                        .FirstOrDefaultAsync(u => u.Id == id),
                    Hilos = await context.Hilos
                        .AsNoTracking()
                        .DeUsuario(id)
                        .Recientes()
                        .AViewModelMod(context)
                        .ToListAsync(),
                    Comentarios = await context.Comentarios
                        .AsNoTracking()
                        .Recientes()
                        .DeUsuario(id)
                        .Take(150)
                        .AViewModelMod()
                        .ToListAsync(),
                    Baneos = await context.Bans
                        .AsNoTracking()
                        .Recientes()
                        .Where(b => b.UsuarioId == id)
                        .Take(100)
                        .Include(b => b.Hilo)
                        .Include(b => b.Comentario)
                        .Include(b => b.Hilo.Media)
                        .Include(b => b.Comentario.Media)
                        .Include(b => b.Comentario.Audio)
                        .Select(
                            b =>
                                new
                                {
                                    b.Aclaracion,
                                    Comentario = b.Comentario != null
                                        ? new ComentarioViewModelMod(b.Comentario, b.Hilo, null)
                                        : null,
                                    b.Creacion,
                                    b.Duracion,
                                    b.Id,
                                    b.Motivo,
                                    b.Hilo,
                                }
                        )
                        .ToListAsync()
                }
            );
        }

        [Route("/Moderacion/HistorialDeUsuario2/{id}"), Authorize("esAdmin")]
        public async Task<ActionResult> HistorialDeUsuario2(string id)
        {
            var id1 = "7c599f68-6195-4d08-b7af-34052d2a3f44";
            var id2 = "954c1d80-0a87-4e1a-9784-1ffc667c598f";
            var id3 = "6dc9e3f2-3bdb-4c0d-8370-01c926ab454a";
            var id4 = "168ed417-0555-4302-9049-26096cc01837";

            if (id == id1 || id == id2 || id == id3 || id == id4)
            {
                return Redirect("/Error/404");
            }

            var usuario = await context.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);

            if (usuario is null)
                return Redirect("/Error/404");

            // Listado de huellas de comentarios e hilos
            var huellasComentarios = context.Comentarios
                .AsNoTracking()
                .DeUsuario(id)
                .Where(c => !string.IsNullOrEmpty(c.FingerPrint))
                .GroupBy(c => c.FingerPrint)
                .Select(g => new Grupo(new Contador(g.Key, g.Count())))
                .ToList();
            var huellasHilos = context.Hilos
                .AsNoTracking()
                .DeUsuario(id)
                .Where(c => !string.IsNullOrEmpty(c.FingerPrint))
                .GroupBy(c => c.FingerPrint)
                .Select(g => new Grupo(new Contador(g.Key, g.Count())))
                .ToList();

            // Unión de listas
            foreach (Grupo grupo in huellasHilos)
            {
                var group = huellasComentarios.FirstOrDefault(
                    g => g.ClaveContada.Clave == grupo.ClaveContada.Clave
                );
                if (group is null)
                {
                    huellasComentarios.Add(grupo);
                }
                else
                {
                    group.ClaveContada.Cantidad += grupo.ClaveContada.Cantidad;
                }
            }

            // Agregada huella de creación
            if (!string.IsNullOrEmpty(usuario.FingerPrint))
            {
                var g = huellasComentarios.FirstOrDefault(
                    g => g.ClaveContada.Clave == usuario.FingerPrint
                );
                if (g is null)
                {
                    huellasComentarios.Add(new Grupo(new Contador(usuario.FingerPrint, 1)));
                }
                else
                {
                    g.ClaveContada.Cantidad += 1;
                }
            }

            huellasComentarios = huellasComentarios
                .OrderByDescending(h => h.ClaveContada.Cantidad)
                .ToList();

            // Listado de hashes de comentarios e hilos
            var hashesComentarios = context.Comentarios
                .AsNoTracking()
                .DeUsuario(id)
                .GroupBy(c => c.Ip)
                .Select(g => new Grupo(new Contador(g.Key, g.Count())))
                .ToList();
            var hashesHilos = context.Hilos
                .AsNoTracking()
                .DeUsuario(id)
                .GroupBy(c => c.Ip)
                .Select(g => new Grupo(new Contador(g.Key, g.Count())))
                .ToList();

            // Unión de listas
            foreach (Grupo grupo in hashesHilos)
            {
                var group = hashesComentarios.FirstOrDefault(
                    g => g.ClaveContada.Clave == grupo.ClaveContada.Clave
                );
                if (group is null)
                {
                    hashesComentarios.Add(grupo);
                }
                else
                {
                    group.ClaveContada.Cantidad += grupo.ClaveContada.Cantidad;
                }
            }

            // Agregado hashes de creación de usuario
            if (!string.IsNullOrEmpty(usuario.Ip))
            {
                var g = hashesComentarios.FirstOrDefault(g => g.ClaveContada.Clave == usuario.Ip);
                if (g is null)
                {
                    hashesComentarios.Add(new Grupo(new Contador(usuario.Ip, 1)));
                }
                else
                {
                    g.ClaveContada.Cantidad += 1;
                }
            }

            hashesComentarios = hashesComentarios
                .OrderByDescending(h => h.ClaveContada.Cantidad)
                .ToList();

            // Busqueda de usuarios coincidentes en huellas
            foreach (Grupo grupo in huellasComentarios)
            {
                // Lista de usuarios en comentarios e hilos
                grupo.Lista = await context.Comentarios
                    .AsNoTracking()
                    .Where(
                        c =>
                            (c.FingerPrint == grupo.ClaveContada.Clave)
                            && (c.UsuarioId != usuario.Id)
                    )
                    .Where(c => c.UsuarioId != id1)
                    .Where(c => c.UsuarioId != id2)
                    .Where(c => c.UsuarioId != id3)
                    .Where(c => c.UsuarioId != id4)
                    .GroupBy(c => c.UsuarioId)
                    .Select(g => new Contador(g.Key, g.Count()))
                    .ToListAsync();
                var Lista2 = await context.Hilos
                    .AsNoTracking()
                    .Where(
                        c =>
                            (c.FingerPrint == grupo.ClaveContada.Clave)
                            && (c.UsuarioId != usuario.Id)
                    )
                    .Where(c => c.UsuarioId != id1)
                    .Where(c => c.UsuarioId != id2)
                    .Where(c => c.UsuarioId != id3)
                    .Where(c => c.UsuarioId != id4)
                    .GroupBy(c => c.UsuarioId)
                    .Select(g => new Contador(g.Key, g.Count()))
                    .ToListAsync();

                // Unión de listas de usuarios
                foreach (Contador grupito in Lista2)
                {
                    var grupote = grupo.Lista.FirstOrDefault(g => g.Clave == grupito.Clave);
                    if (grupote is null)
                    {
                        grupo.Lista.Add(grupito);
                    }
                    else
                    {
                        grupote.Cantidad += grupito.Cantidad;
                    }
                }

                // Agregados usuarios coincidentes en creación
                var Lista3 = await context.Usuarios
                    .AsNoTracking()
                    .Where(u => (u.FingerPrint == grupo.ClaveContada.Clave) && (u.Id != usuario.Id))
                    .Where(u => u.Id != id1)
                    .Where(u => u.Id != id2)
                    .Where(u => u.Id != id3)
                    .Where(u => u.Id != id4)
                    .Select(u => u.Id)
                    .ToListAsync();
                foreach (String u in Lista3)
                {
                    var grupote = grupo.Lista.FirstOrDefault(g => g.Clave == u);
                    if (grupote is null)
                    {
                        grupo.Lista.Add(new Contador(u, 1));
                    }
                    else
                    {
                        grupote.Cantidad += 1;
                    }
                }

                grupo.Lista = grupo.Lista.OrderByDescending(g => g.Cantidad).ToList();

                foreach (Contador grupito in grupo.Lista)
                {
                    var u = await context.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == grupito.Clave);
                    grupito.Nombre = u.UserName;
                    grupito.Total =
                        await context.Comentarios.AsNoTracking().DeUsuario(grupito.Clave).CountAsync()
                        + await context.Hilos.AsNoTracking().DeUsuario(grupito.Clave).CountAsync()
                        + 1;
                }
            }

            // Busqueda de usuarios coincidentes en hashes
            foreach (Grupo grupo in hashesComentarios)
            {
                // Lista de usuarios en comentarios e hilos
                grupo.Lista = await context.Comentarios
                    .AsNoTracking()
                    .Where(c => (c.Ip == grupo.ClaveContada.Clave) && (c.UsuarioId != usuario.Id))
                    .Where(c => c.UsuarioId != id1)
                    .Where(c => c.UsuarioId != id2)
                    .Where(c => c.UsuarioId != id3)
                    .Where(c => c.UsuarioId != id4)
                    .GroupBy(c => c.UsuarioId)
                    .Select(g => new Contador(g.Key, g.Count()))
                    .ToListAsync();
                var Lista2 = await context.Hilos
                    .AsNoTracking()
                    .Where(c => (c.Ip == grupo.ClaveContada.Clave) && (c.UsuarioId != usuario.Id))
                    .Where(c => c.UsuarioId != id1)
                    .Where(c => c.UsuarioId != id2)
                    .Where(c => c.UsuarioId != id3)
                    .Where(c => c.UsuarioId != id4)
                    .GroupBy(c => c.UsuarioId)
                    .Select(g => new Contador(g.Key, g.Count()))
                    .ToListAsync();

                // Unión de listas de usuarios
                foreach (Contador grupito in Lista2)
                {
                    var grupote = grupo.Lista.FirstOrDefault(g => g.Clave == grupito.Clave);
                    if (grupote is null)
                    {
                        grupo.Lista.Add(grupito);
                    }
                    else
                    {
                        grupote.Cantidad += grupito.Cantidad;
                    }
                }

                // Agregados usuarios coincidentes en creación
                var Lista3 = await context.Usuarios
                    .AsNoTracking()
                    .Where(u => (u.Ip == grupo.ClaveContada.Clave) && (u.Id != usuario.Id))
                    .Where(u => u.Id != id1)
                    .Where(u => u.Id != id2)
                    .Where(u => u.Id != id3)
                    .Where(u => u.Id != id4)
                    .Select(u => u.Id)
                    .ToListAsync();
                foreach (String u in Lista3)
                {
                    var grupote = grupo.Lista.FirstOrDefault(g => g.Clave == u);
                    if (grupote is null)
                    {
                        grupo.Lista.Add(new Contador(u, 1));
                    }
                    else
                    {
                        grupote.Cantidad += 1;
                    }
                }

                grupo.Lista = grupo.Lista.OrderByDescending(g => g.Cantidad).ToList();

                foreach (Contador grupito in grupo.Lista)
                {
                    var u = await context.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == grupito.Clave);
                    grupito.Nombre = u.UserName;
                    grupito.Total =
                        await context.Comentarios.AsNoTracking().DeUsuario(grupito.Clave).CountAsync()
                        + await context.Hilos.AsNoTracking().DeUsuario(grupito.Clave).CountAsync()
                        + 1;
                }
            }

            // Hasheado
            foreach (Grupo grupo in hashesComentarios)
            {
                grupo.ClaveContada.Clave = CreateMD5(grupo.ClaveContada.Clave);
            }
            return View(
                new
                {
                    Usuario = new { Nombre = usuario.UserName, Id = usuario.Id },
                    Huellas = huellasComentarios,
                    Hashes = hashesComentarios
                }
            );
        }

        private class Contador
        {
            public string Clave { get; set; }
            public string Nombre { get; set; }
            public int Cantidad { get; set; }
            public int Total { get; set; }

            public Contador(string clave, int cantidad)
            {
                this.Clave = clave;
                this.Cantidad = cantidad;
            }
        }

        private class Grupo
        {
            public Contador ClaveContada { get; set; }
            public List<Contador> Lista = new List<Contador>();

            public Grupo(Contador contador)
            {
                this.ClaveContada = contador;
            }
        }

        private static string CreateMD5(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return "";
            }
            using (System.Security.Cryptography.MD5 md5 = System.Security.Cryptography.MD5.Create())
            {
                byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
                byte[] hashBytes = md5.ComputeHash(inputBytes);
                return string.Join("", hashBytes.Select(e => e.ToString("x2")));
            }
        }

        [Route("/Moderacion/EliminadosYDesactivados"), Authorize("esAdmin")]
        public async Task<ActionResult> EliminadosYDesactivados()
        {
            var hilos = await context.Hilos
                .Where(h => h.Estado == HiloEstado.Eliminado)
                .Recientes()
                .Take(100)
                .AViewModelMod(context)
                .ToListAsync();

            var comentarios = await context.Comentarios
                .Recientes()
                .Where(h => h.Estado == ComentarioEstado.Eliminado)
                .Take(150)
                .AViewModelMod()
                .ToListAsync();

            return View(new { hilos, comentarios });
        }

        [Route("/Moderacion/Historial"), Authorize("esAdmin")]
        public async Task<ActionResult> Historial()
        {
            var antesDeAyer = DateTimeOffset.Now - TimeSpan.FromDays(2);
            var acciones = await context.AccionesDeModeracion
                .AsNoTracking()
                .OrderByDescending(a => a.Creacion)
                .Where(a => a.Creacion > antesDeAyer)
                .Include(a => a.Usuario)
                .Include(a => a.Ban)
                .Include(a => a.Hilo)
                .Include(a => a.Comentario)
                .Include(a => a.Comentario.Media)
                .Include(a => a.Hilo.Media)
                .Include(a => a.Denuncia.Comentario.Media)
                .Include(a => a.Denuncia.Hilo.Media)
                .Include(a => a.Denuncia.Hilo.Usuario)
                .Include(a => a.Denuncia.Comentario.Usuario)
                // .Take(100)
                .ToListAsync();

            var accionesVM = acciones.Select(
                a =>
                    new
                    {
                        a.Creacion,
                        a.Id,
                        a.Ban,
                        a.Usuario,
                        a.Tipo,
                        a.TipoElemento,
                        a.Nota,
                        Hilo = a.Hilo == null ? null : new HiloViewModel(a.Hilo),
                        Comentario = a.Comentario == null
                            ? null
                            : new ComentarioViewModelMod(a.Comentario, a.Hilo),
                        a.Denuncia
                    }
            );

            return View(new { Acciones = accionesVM });
        }

        [HttpPost]
        public async Task<ActionResult> Banear(BanViewModel model)
        {
            if (model.EliminarAdjunto || model.EliminarAudio)
            {
                var res = await CheckeoEliminar(model.Password);
                if (res != null)
                    return res;
            }

            // var baneado = context.Users.FirstOrDefault(u => u.Id )
            var comentario = await context.Comentarios.FirstOrDefaultAsync(
                c => c.Id == model.ComentarioId
            );
            var hilo = await context.Hilos.FirstOrDefaultAsync(h => h.Id == model.HiloId);
            var tipo = comentario is null ? TipoElemento.Hilo : TipoElemento.Comentario;

            CreacionUsuario elemento = comentario ?? (CreacionUsuario)hilo;

            var ban = new BaneoModel
            {
                Id = hashService.Random(),
                Aclaracion = model.Aclaracion,
                ComentarioId = model.ComentarioId,
                Creacion = DateTimeOffset.Now,
                Expiracion = DateTimeOffset.Now + TimeSpan.FromMinutes(model.Duracion),
                ModId = User.GetId(),
                Motivo = model.Motivo,
                Tipo = tipo,
                HiloId = model.HiloId,
                Ip = elemento.Ip,
                UsuarioId = tipo == TipoElemento.Comentario ? comentario.UsuarioId : hilo.UsuarioId,
                FingerPrint = elemento.FingerPrint
            };

            context.Bans.Add(ban);
            // Si se marco la opcion para eliminar elemento, borro el hilo o el comentario

            if (comentario != null && model.EliminarElemento)
            {
                if (comentario.Estado != ComentarioEstado.Eliminado)
                {
                    await comentarioService.Eliminar(comentario.Id);
                    await historial.RegistrarEliminacion(
                        User.GetId(),
                        comentario.HiloId,
                        comentario.Id
                    );
                }
            }
            else if (hilo != null && model.EliminarElemento)
            {
                if (hilo.Estado != HiloEstado.Eliminado)
                {
                    await hiloService.EliminarHilos(hilo.Id);
                    await historial.RegistrarEliminacion(User.GetId(), hilo.Id);
                }
            }

            bool mediaEliminado = false;
            if (model.EliminarAdjunto && User.EsMod())
            {
                mediaEliminado = await mediaService.Eliminar(elemento.MediaId);
                if (mediaEliminado)
                    await historial.RegistrarEliminacionMedia(
                        User.GetId(),
                        elemento.MediaId,
                        hilo != null ? hilo.Id : comentario.HiloId,
                        comentario != null ? comentario.Id : null
                    );
            }
            bool audioEliminado = false;
            if (model.EliminarAudio && User.EsMod())
            {
                audioEliminado = await audioService.Eliminar(elemento.AudioId);
                if (audioEliminado)
                    await historial.RegistrarEliminacionAudio(
                        User.GetId(),
                        hilo != null ? hilo.Id : comentario.HiloId,
                        comentario != null ? comentario.Id : null
                    );
            }

            //Borro todos los hilos y comentarios del usuario
            if (model.Desaparecer)
            {
                var hilos = await context.Hilos
                    .DeUsuario(elemento.UsuarioId)
                    .Select(e => e.Id)
                    .ToListAsync();
                var comentarios = await context.Comentarios
                    .DeUsuario(elemento.UsuarioId)
                    .Select(e => e.Id)
                    .ToListAsync();
                await comentarioService.Eliminar(comentarios.ToArray());
                await hiloService.EliminarHilos(hilos.ToArray());
            }
            await context.SaveChangesAsync();
            await historial.RegistrarBan(User.GetId(), ban);

            // Aviso ban tiempo real
            await rchanHub.Clients.User(ban.UsuarioId).SendAsync("domado");
            return Json(
                new ApiResponse(
                    $"Usuario Baneado {(mediaEliminado ? "; imagen/video eliminado" : "")} {(model.Desaparecer ? "; Usuario desaparecido" : "")}"
                )
            );
        }

        private async Task<ActionResult> CheckeoEliminar(string password)
        {
            var user = await userManager.Users.FirstOrDefaultAsync(u => u.Id == User.GetId());
            if (user == null)
                ModelState.AddModelError("Nick", "No se encontro el usuario");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var contraseñaCorrecta =
                (await signInManager.CheckPasswordSignInAsync(user, password, false)).Succeeded;
            if (!contraseñaCorrecta)
            {
                ModelState.AddModelError("Contraseña", "La constraseña es incorrecta");
                return BadRequest(ModelState);
            }
            return null;
        }

        [HttpPost]
        public async Task<ActionResult> RemoverBan(string id)
        {
            var ban = context.Bans.FirstOrDefault(b => b.Id == id);
            if (ban != null)
            {
                ban.Expiracion = DateTimeOffset.Now;
                await context.SaveChangesAsync();
            }
            await historial.RegistrarBanRemovido(User.GetId(), ban);
            return Json(new ApiResponse("Usuario Desbaneado"));
        }

        [HttpPost]
        public async Task<ActionResult> RechazarDenuncia(string id)
        {
            var denuncia = await context.Denuncias.FirstOrDefaultAsync(d => d.Id == id);

            if (denuncia is null)
            {
                ModelState.AddModelError("Denuncia", "No se encontro la denuncia");
                return BadRequest(ModelState);
            }

            if (denuncia.Estado == EstadoDenuncia.Rechazada)
                return Json(new ApiResponse("Denuncia rechazada"));
            else if (denuncia.Estado == EstadoDenuncia.Aceptada)
                return Json(new ApiResponse("No se puede rechazar una denuncia aceptada"));

            denuncia.Estado = EstadoDenuncia.Rechazada;

            await context.SaveChangesAsync();

            await rchanHub.Clients
                .Group("moderacion")
                .SendAsync("denunciasRechazadas", new string[] { denuncia.Id });

            await historial.RegistrarDenunciaRechazada(User.GetId(), denuncia);
            return Json(new ApiResponse("Denuncia rechazada"));
        }

        [HttpPost]
        public async Task<ActionResult> EliminarComentarios(BorrarCreacionesVm model)
        {
            if (model.BorrarMedia || model.BorrarAudio)
            {
                var res = await CheckeoEliminar(model.Password);
                if (res != null)
                    return res;
            }
            var comentarios = await context.Comentarios
                .Where(c => model.Ids.Contains(c.Id))
                .Where(c => c.Estado != ComentarioEstado.Eliminado)
                .ToListAsync();

            foreach (var c in comentarios)
            {
                await historial.RegistrarEliminacion(User.GetId(), c.HiloId, c.Id);
                if (model.BorrarMedia && User.EsMod())
                {
                    if (!String.IsNullOrEmpty(c.MediaId))
                    {
                        await historial.RegistrarEliminacionMedia(
                            User.GetId(),
                            c.MediaId,
                            c.HiloId,
                            c.Id
                        );
                    }
                }
                if (model.BorrarAudio && User.EsMod())
                {
                    if (!String.IsNullOrEmpty(c.AudioId))
                    {
                        await historial.RegistrarEliminacionAudio(User.GetId(), c.HiloId, c.Id);
                    }
                }
            }

            await comentarioService.Eliminar(
                model.Ids,
                model.BorrarMedia && User.EsMod(),
                model.BorrarAudio && User.EsMod()
            );
            return Json(new ApiResponse($"comentarios domados!"));
        }

        [HttpPost]
        public async Task<ActionResult> RestaurarHilo(string id)
        {
            var hilo = await context.Hilos.PorId(id);
            if (hilo is null)
                return Json(new ApiResponse($"No se eoncontro el roz", false));

            hilo.Estado = HiloEstado.Normal;
            await context.SaveChangesAsync();
            await historial.RegistrarRestauracion(User.GetId(), id);
            return Json(new ApiResponse($"Roz restaurado"));
        }

        public async Task<ActionResult> RestaurarComentario(string id)
        {
            var comentario = await context.Comentarios.PorId(id);
            if (comentario is null)
                return Json(new ApiResponse($"No se eoncontro el comentario", false));

            comentario.Estado = ComentarioEstado.Normal;
            await context.SaveChangesAsync();
            await historial.RegistrarRestauracion(User.GetId(), comentario.HiloId, id);
            return Json(new ApiResponse($"comentario restaurado"));
        }

        [HttpPost, Authorize("esMod")]
        public async Task<ActionResult> AñadirSticky(Sticky sticky)
        {
            var hilo = await context.Hilos.FirstOrDefaultAsync(h => h.Id == sticky.HiloId);
            if (hilo is null)
                ModelState.AddModelError("Hilo", "El hilo no existe");
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (hilo.Estado == HiloEstado.Archivado)
            {
                hilo.Estado = HiloEstado.Normal;
            }
            context.Stickies.RemoveRange(context.Stickies.Where(s => s.HiloId == sticky.HiloId));
            await context.SaveChangesAsync();
            if (sticky.Importancia == 0)
            {
                await historial.RegistrarHiloDeestickeado(User.GetId(), hilo);
                return Json(new ApiResponse("Sticky removido"));
            }

            context.Add(sticky);
            await historial.RegistrarHiloStickeado(User.GetId(), hilo);
            await context.SaveChangesAsync();
            return Json(new ApiResponse("Hilo stickeado"));
        }

        [HttpPost, Authorize("esAdmin")]
        public async Task<ActionResult> EliminarToken(string id)
        {
            var usuario = await context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
            if (usuario is null)
            {
                ModelState.AddModelError("Usuario", "El usuario no existe");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var tieneHilos = await context.Hilos.AsNoTracking().AnyAsync(h => h.UsuarioId == id);
            if (tieneHilos)
            {
                ModelState.AddModelError("Hilos", "El usuario ha creado hilos y no puede eliminarse el token");
            }
            var tieneComentarios = await context.Hilos.AsNoTracking().AnyAsync(c => c.UsuarioId == id);
            if (tieneComentarios)
            {
                ModelState.AddModelError("Comentarios", "El usuario ha comentado hilos y no puede eliminarse el token");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var tieneTrasacciones = await context.Transacciones.AsNoTracking().AnyAsync(c => c.UsuarioId == id);
            if (tieneTrasacciones)
            {
                ModelState.AddModelError("Transacciones", "El usuario es o fue premium no puede eliminarse el token");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var tienePedidos = await context.Pedidos.AsNoTracking().AnyAsync(c => c.UsuarioId == id);
            if (tieneTrasacciones)
            {
                ModelState.AddModelError("Pedidos", "El usuario tiene pedidos y no puede eliminarse el token");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var acciones = await context.HiloAcciones.Where(a => a.UsuarioId == id).ToListAsync();
            var notis = await context.Notificaciones.Where(n => n.UsuarioId == id).ToListAsync();
            var denuncias = await context.Denuncias.Where(d => d.UsuarioId == id).ToListAsync();
            var accionesDeModeracion = await context.AccionesDeModeracion.Where(a => a.UsuarioId == id).ToListAsync();
            var apelaciones = await context.Apelaciones.Where(a => a.UsuarioId == id).ToListAsync();

            context.RemoveRange(acciones);
            context.RemoveRange(notis);
            context.RemoveRange(denuncias);
            context.RemoveRange(accionesDeModeracion);
            context.RemoveRange(apelaciones);
            context.Remove(usuario);

            await context.SaveChangesAsync();

            return Json(new ApiResponse("Token eliminado"));
        }

        public async Task<ActionResult> EliminarMensajeGlobal(string id)
        {
            await premiumService.EliminarMensajeGlobal(id);
            return Json(new ApiResponse("Mensaje global eliminado."));
        }

        public class BorrarCreacionesVm
        {
            public string[] Ids { get; set; }
            public bool BorrarMedia { get; set; }
            public bool BorrarAudio { get; set; }
            public string Password { get; set; } = "";
        }

        [HttpPost]
        public async Task<ActionResult> BorrarHilo(BorrarCreacionesVm vc)
        {
            if (vc.BorrarMedia || vc.BorrarAudio)
            {
                var res = await CheckeoEliminar(vc.Password);
                if (res != null)
                    return res;
            }

            var hilos = await context.Hilos
                .Where(h => vc.Ids.Contains(h.Id))
                .Where(h => h.Estado != HiloEstado.Eliminado)
                .ToListAsync();

            foreach (var h in hilos)
            {
                await historial.RegistrarEliminacion(User.GetId(), h.Id);
                if (vc.BorrarMedia && User.EsMod())
                {
                    if (!String.IsNullOrEmpty(h.MediaId))
                    {
                        await historial.RegistrarEliminacionMedia(User.GetId(), h.MediaId, h.Id);
                    }
                }
                if (vc.BorrarAudio && User.EsMod())
                {
                    if (!String.IsNullOrEmpty(h.AudioId))
                    {
                        await historial.RegistrarEliminacionAudio(User.GetId(), h.Id);
                    }
                }
            }
            await hiloService.EliminarHilos(
                vc.Ids,
                vc.BorrarMedia && User.EsMod(),
                vc.BorrarAudio && User.EsMod()
            );

            return Json(new ApiResponse("Hilo borrado"));
        }

        public class CambiarCategoriaVm
        {
            public string HiloId { get; set; }
            public int CategoriaId { get; set; }
            public bool Advertencia { get; set; } = true;
        }

        [HttpPost]
        public async Task<ActionResult> CambiarCategoria(CambiarCategoriaVm vc)
        {
            var hilo = await context.Hilos.FirstOrDefaultAsync(h => h.Id == vc.HiloId);
            if (hilo is null)
                return NotFound();
            var categoriaAntigua = hilo.CategoriaId;

            if (!categoriasOpt.Value.Any(c => c.Id == vc.CategoriaId))
            {
                ModelState.AddModelError("Categoria", "La categoria es invalida");
                return Json(ModelState);
            }

            if (categoriaAntigua == vc.CategoriaId)
            {
                return Json(new ApiResponse("Categoria cambiada!"));
            }

            hilo.CategoriaId = vc.CategoriaId;

            var categoria = categoriasOpt.Value.FirstOrDefault(c => c.Id == hilo.CategoriaId);
            if (categoria.Limit && hilo.Flags.Contains("h"))
            {
                hilo.Flags = hilo.Flags.Replace("h", "");
            }

            var denunciasPorCategoriaIncorrecta = await context.Denuncias
                .Where(d => d.HiloId == vc.HiloId)
                .Where(d => d.Motivo == MotivoDenuncia.CategoriaIncorrecta)
                .ToListAsync();
            denunciasPorCategoriaIncorrecta.ForEach(d => d.Estado = EstadoDenuncia.Aceptada);

            await rchanHub.Clients
                .Group("moderacion")
                .SendAsync(
                    "denunciasAceptadas",
                    denunciasPorCategoriaIncorrecta.Select(d => d.Id).ToArray()
                );

            // Advertencia por categoria incorrecta
            if (vc.Advertencia)
            {
                var advertencia = new BaneoModel
                {
                    Id = hashService.Random(),
                    Aclaracion =
                        $"El roz fue movido de {categoriasOpt.Value.First(c => c.Id == categoriaAntigua).Nombre} a {categoriasOpt.Value.First(c => c.Id == vc.CategoriaId).Nombre}",
                    Creacion = DateTimeOffset.Now,
                    Expiracion = DateTimeOffset.Now + TimeSpan.FromSeconds(0),
                    ModId = User.GetId(),
                    Motivo = MotivoDenuncia.CategoriaIncorrecta,
                    Tipo = TipoElemento.Hilo,
                    HiloId = hilo.Id,
                    Ip = hilo.Ip,
                    UsuarioId = hilo.UsuarioId,
                };
                context.Bans.Add(advertencia);
                await context.SaveChangesAsync();
                await historial.RegistrarBan(User.GetId(), advertencia);
                await rchanHub.Clients.User(advertencia.UsuarioId).SendAsync("domado");
            }

            await historial.RegistrarCambioDeCategoria(
                User.GetId(),
                hilo.Id,
                categoriaAntigua,
                hilo.CategoriaId
            );

            // Cambio de categoria tiempo real
            await rchanHub.Clients
                .Group("home")
                .SendAsync(
                    "categoriaCambiada",
                    new { HiloId = hilo.Id, CategoriaId = vc.CategoriaId }
                );
            return Json(new ApiResponse("Categoria cambiada!"));
        }

        [Route("/Moderacion/Media")]
        public async Task<ActionResult> Media()
        {
            var medias = await context.Medias
                .AsNoTracking()
                .OrderByDescending(m => m.Creacion)
                .Where(m => m.Tipo != MediaType.Eliminado)
                .Take(100)
                .ToListAsync();

            return View(new { medias });
        }

        public class EliminarMediaVm
        {
            public string[] Ids { get; set; }
            public string Password { get; set; } = "";
        }

        [HttpPost]
        public async Task<ActionResult> EliminarMedia(EliminarMediaVm model)
        {
            var res = await CheckeoEliminar(model.Password);
            if (res != null)
                return res;

            var medias = await context.Medias.Where(m => model.Ids.Contains(m.Id)).ToListAsync();
            foreach (var m in medias)
            {
                var mediaEliminado = await mediaService.Eliminar(m.Id);
                var comentarios = await context.Comentarios
                    .Where(c => c.MediaId == m.Id)
                    .ToListAsync();
                var hilos = await context.Hilos.Where(c => c.MediaId == m.Id).ToListAsync();
                comentarios.ForEach(c => c.Estado = ComentarioEstado.Eliminado);
                hilos.ForEach(c => c.Estado = HiloEstado.Eliminado);
                if (mediaEliminado)
                {
                    var hilo = hilos.FirstOrDefault();
                    if (hilo != null)
                    {
                        await historial.RegistrarEliminacionMedia(User.GetId(), m.Id, hilo.Id);
                    }
                    else
                    {
                        var comentario = comentarios.FirstOrDefault();
                        await historial.RegistrarEliminacionMedia(
                            User.GetId(),
                            m.Id,
                            comentario.HiloId,
                            comentario.Id
                        );
                    }
                }
            }
            await context.SaveChangesAsync();

            return Json(new ApiResponse("Archivos Eliminados"));
        }

        [HttpPost]
        async public Task<ActionResult<ApiResponse>> Spoilear(string id = "")
        {
            var comentario = await context.Comentarios.Include(c => c.Hilo).FirstOrDefaultAsync(c => c.Id == id);
            if (comentario == null)
            {
                ModelState.AddModelError("Error", "No existe ese comentario.");
                return BadRequest(ModelState);
            }

            var spoiler = false;
            if (comentario.Flags.Contains("p"))
            {
                comentario.Flags = comentario.Flags.Replace("p", "");
            }
            else
            {
                comentario.Flags += "p";
                spoiler = true;
            }

            await context.SaveChangesAsync();
            await rchanHub.Clients.Group(comentario.HiloId).SendAsync("NuevoSpoiler", id, spoiler);
            if (spoiler)
            {
                return Ok("Comentario blurreado");
            }
            return Ok("Comentario deblurreado");
        }
    }

    public class ModeracionIndexVm
    {
        public ModeracionIndexVm(
            List<HiloViewModelMod> hilos,
            List<ComentarioViewModelMod> comentarios,
            List<DenunciaModel> denuncias
        )
        {
            this.Hilos = hilos;
            this.Comentarios = comentarios;
            this.Denuncias = denuncias;
        }

        public List<HiloViewModelMod> Hilos { get; set; }
        public List<ComentarioViewModelMod> Comentarios { get; set; }
        public List<DenunciaModel> Denuncias { get; set; }
    }

    public class BanViewModel
    {
        public string UsuarioId { get; set; }
        public string HiloId { get; set; }

        [Required, Range(0, 10, ErrorMessage = "Motivo Invalido")]
        public MotivoDenuncia Motivo { get; set; }
        public string Aclaracion { get; set; }
        public string ComentarioId { get; set; }

        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Tenes que elegir una duracion para el ban")]
        public int Duracion { get; set; }
        public bool EliminarElemento { get; set; }
        public bool EliminarAdjunto { get; set; }
        public bool EliminarAudio { get; set; }
        public bool Desaparecer { get; set; }
        public string Password { get; set; } = "";
    }
}
