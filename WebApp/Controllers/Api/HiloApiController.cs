using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore;
using Microsoft.Extensions.Logging;
using Servicios;
using System.Collections.Generic;
using Modelos;
using System.Threading.Tasks;
using System.Net;
using System;
using WebApp;
using Microsoft.AspNetCore.Authorization;
using Data;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using Microsoft.Extensions.Options;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;
using WebApp.Otros;

namespace WebApp.Controllers
{
    [ApiController, Route("api/Hilo/{action}/{id?}")]
    public class HiloApiController : ControllerBase
    {
        private readonly IHiloService hiloService;
        private readonly IMediaService mediaService;
        private readonly HashService hashService;
        private readonly IHubContext<RChanHub> rchanHub;
        private readonly RChanContext context;
        private readonly IOptionsSnapshot<List<Categoria>> categoriasOpt;
        private readonly IOptionsSnapshot<GeneralOptions> generalOptions;
        private readonly CaptchaService captcha;
        private readonly AntiFloodService antiFlood;
        private readonly EstadisticasService estadisticasService;
        private readonly RChanCacheService rchanCacheService;
        private readonly CensorService censorService;
        private static readonly HashSet<string> denunciasIp = new HashSet<string>();
        private readonly IAudioService audioService;

        #region constructor
        public HiloApiController(
            IHiloService hiloService,
            IMediaService mediaService,
            HashService hashService,
            IHubContext<RChanHub> rchanHub,
            RChanContext context,
            IOptionsSnapshot<List<Categoria>> categoriasOpt,
            IOptionsSnapshot<GeneralOptions> generalOptions,
            CaptchaService captcha,
            AntiFloodService antiFlood,
            EstadisticasService estadisticasService,
            RChanCacheService rchanCacheService,
            CensorService censorService,
            IAudioService audioService
        )
        {
            this.hiloService = hiloService;
            this.mediaService = mediaService;
            this.hashService = hashService;
            this.rchanHub = rchanHub;
            this.context = context;
            this.categoriasOpt = categoriasOpt;
            this.generalOptions = generalOptions;
            this.captcha = captcha;
            this.antiFlood = antiFlood;
            this.estadisticasService = estadisticasService;
            this.rchanCacheService = rchanCacheService;
            this.censorService = censorService;
            this.audioService = audioService;
        }
        #endregion

        [Authorize]
        public async Task<ActionResult> Crear([FromForm] CrearHiloViewModel vm)
        {
            bool existeLaCategoria = categoriasOpt.Value.Any(c => c.Id == vm.CategoriaId);

            if (!existeLaCategoria) ModelState.AddModelError("Categoria", "Ay no existe la categoria");
            if (vm.Archivo is null && string.IsNullOrWhiteSpace(vm.Link))
                ModelState.AddModelError("adjunto", "Para crear un roz tenes que adjuntar un archivo o un link");

            var pasoElCaptcha = await captcha.Verificar(vm.Captcha);
            if (!pasoElCaptcha && generalOptions.Value.CaptchaHilo && !User.EsMod())
            {
                ModelState.AddModelError("Captcha", "Incorrecto");
            }
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Chequeuear si es flood
            if (antiFlood.SegundosParaHilo(User) != new TimeSpan(0))
            {
                var minutos = antiFlood.SegundosParaHilo(User).Minutes;
                ModelState.AddModelError("Para para", $"faltan {minutos} minuto{(minutos != 1 ? "s" : "")} para que puedas crear otro roz");
                return BadRequest(ModelState);
            }
            else
            {
                antiFlood.HaCreadoHilo(User.GetId());
            }

            // Chequeuear si esta Baneado
            var ip = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
            var hilo = new HiloModel
            {
                UsuarioId = User.GetId(),
                Titulo = vm.Titulo,
                Contenido = vm.Contenido,
                CategoriaId = vm.CategoriaId,
                Bump = DateTimeOffset.Now,
                Ip = ip,
                FingerPrint = vm.FingerPrint
            };

            //Encuestas
            var result = AgregarEncuesta(vm, hilo);
            if (result != null) return result;

            MediaModel media = null;
            try
            {
                if (vm.Archivo != null)
                {
                    if (!new[] { "jpeg", "jpg", "gif", "mp4", "webm", "png" }.Contains(vm.Archivo.ContentType.Split("/")[1]))
                    {
                        ModelState.AddModelError("Archivo invalido", "");
                        antiFlood.ResetearSegundosParaHilo(User.GetId());
                        return BadRequest(ModelState);
                    }
                    media = await mediaService.GenerarMediaDesdeArchivo(vm.Archivo, User.EsMod());
                }
                else if (!string.IsNullOrWhiteSpace(vm.Link))
                {
                    media = await mediaService.GenerarMediaDesdeLink(vm.Link, User.EsMod());
                }
            }
            catch (Exception e)
            {
                ModelState.AddModelError("El archivo es muy pesado (+10mb) o el formato no es soportado", "");
                Console.WriteLine(e);
                antiFlood.ResetearSegundosParaHilo(User.GetId());
                return BadRequest(ModelState);
            }

            if (media is null)
            {
                ModelState.AddModelError("Chocamo", "No se pudo subir el archivo o importar el link");
                antiFlood.ResetearSegundosParaHilo(User.GetId());
                return BadRequest(ModelState);
            }

            if ((media.Tipo == MediaType.PornHub) && (categoriasOpt.Value.Sfw().Any(c => c.Id == vm.CategoriaId)))
            {
                ModelState.AddModelError("Chocamo", "Categoría incorrecta");
                antiFlood.ResetearSegundosParaHilo(User.GetId());
                return BadRequest(ModelState);
            }

            hilo.Media = media;
            hilo.MediaId = media.Id;

            AudioModel audio = null;
            try
            {
                if (vm.Audio != null)
                {
                    audio = await audioService.GenerarAudio(vm.Audio);
                }
            }
            catch (Exception e)
            {
                ModelState.AddModelError("No se pudo subir el audio", "");
                Console.WriteLine(e);
                antiFlood.ResetearSegundosComentario(User.GetId());
                return BadRequest(ModelState);
            }

            if (audio != null)
            {
                hilo.Audio = audio;
                hilo.AudioId = audio.Id;
            }

            // MarkDown solo para mods
            if (!User.EsMod()) hilo.Contenido = hilo.Contenido.Replace(">>md", "");

            if (hilo.Contenido.Contains(">>concentracion") && User.EsMod()) hilo.Flags += "c";
            if (hilo.Contenido.Contains(">>serio") && User.EsMod()) hilo.Flags += "si";
            if (hilo.Contenido.Contains(">>banderitas")) hilo.Flags += "b";

            // Agrego el pais del uusario
            // if(Request.Headers.TryGetValue("cf-ipcountry", out var paisValue))
            // {
            //     hilo.Pais = paisValue.ToString().ToLower();
            // }

            string id = await hiloService.GuardarHilo(hilo);

            // El op sigue a su hilo
            context.HiloAcciones.Add(new HiloAccionModel
            {
                Id = hashService.Random(),
                Seguido = true,
                UsuarioId = hilo.UsuarioId,
                HiloId = id,
            });

            //Agrego rango y nombre
            if (User.EsMod())
            {
                if (vm.MostrarNombre) hilo.Nombre = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name")?.Value ?? "";
                if (vm.MostrarRango) hilo.Rango = CreacionRango.Mod;
            }

            await context.SaveChangesAsync();
            var viewModel = new HiloViewModel(hilo);
            await rchanHub.Clients.Group("home").SendAsync("HiloCreado", viewModel);
            var viewModelMod = new HiloViewModelMod(hilo);
            await rchanHub.Clients.Group("moderacion").SendAsync("HiloCreadoMod", viewModelMod);

            await estadisticasService.RegistrarNuevoHilo();

            if (censorService.BuscarPalabras(hilo.Titulo) || censorService.BuscarPalabras(hilo.Contenido))
            {
                DenunciaVM denunciaAutomatica = new DenunciaVM();
                denunciaAutomatica.Tipo = TipoElemento.Hilo;
                denunciaAutomatica.Motivo = MotivoDenuncia.ContenidoIlegal;
                denunciaAutomatica.HiloId = id;
                denunciaAutomatica.Aclaracion = "[Denuncia automática] Se mencionó palabra en la lista negra";
                await AutoDenunciar(denunciaAutomatica);
            }

            if (censorService.BuscarPalabras(hilo.FingerPrint))
            {
                DenunciaVM denunciaAutomatica = new DenunciaVM();
                denunciaAutomatica.Tipo = TipoElemento.Hilo;
                denunciaAutomatica.Motivo = MotivoDenuncia.ContenidoIlegal;
                denunciaAutomatica.HiloId = id;
                denunciaAutomatica.Aclaracion = $"[Denuncia automática] Usuario sospechoso FP: {hilo.FingerPrint}";
                await AutoDenunciar(denunciaAutomatica);
            }

            return Created($"/Hilo/{id}", null);
        }

        [HttpPost, Authorize]
        public async Task<ActionResult<ApiResponse>> Agregar([FromBody] AccionVM model)
        {
            if (!await context.Hilos.AnyAsync(h => h.Id == model.HiloId)) return NotFound();
            var acciones = await context.HiloAcciones
                .FirstOrDefaultAsync(a => a.UsuarioId == User.GetId() && a.HiloId == model.HiloId);

            if (acciones == null)
            {
                acciones = new HiloAccionModel
                {
                    Id = hashService.Random(),
                    UsuarioId = User.GetId(),
                    HiloId = model.HiloId,
                };
                await context.HiloAcciones.AddAsync(acciones);
            }

            var añadido = false;
            if (model.Accion == "favoritos")
            {
                añadido = acciones.Favorito = !acciones.Favorito;
            }
            else if (model.Accion == "seguidos")
            {
                añadido = acciones.Seguido = !acciones.Seguido;
            }
            else if (model.Accion == "ocultos")
            {
                añadido = acciones.Hideado = !acciones.Hideado;
            }

            await context.SaveChangesAsync();
            return new ApiResponse($"{(añadido ? "añadido a" : "removido de")} {model.Accion}");
        }

        [Produces("application/json")]
        public async Task<ActionResult<ApiResponse>> Get(string id)
        {
            var hilo = await hiloService.GetHiloFull(id, User.GetId());
            if (hilo is null) return NotFound();
            return new ApiResponse(value: hilo);
        }

        async public Task<ActionResult<ApiResponse>> Index()
        {
            return new ApiResponse(value: hiloService.GetHilosOrdenadosPorBump());
        }

        [AllowAnonymous]
        async public Task<ActionResult<ApiResponse>> Denunciar(DenunciaVM vc)
        {
            if (generalOptions.Value.IgnorarDenunciasAnonimas && !User.Identity.IsAuthenticated)
            {
                return new ApiResponse("Denuncia enviada");
            }
            // Se ignora la denuncia de los usuarios sin comentarios ni hilos
            var numeroHilosComentarios = await context.Hilos.DeUsuario(User.GetId()).CountAsync() + await context.Comentarios.DeUsuario(User.GetId()).CountAsync();
            if (generalOptions.Value.IgnorarDenunciasAnonimas && numeroHilosComentarios == 0)
            {
                return new ApiResponse("Denuncia enviada");
            }
            if (generalOptions.Value.RestriccionDeAcceso != RestriccionDeAcceso.Publico && !User.Identity.IsAuthenticated)
            {
                ModelState.AddModelError("Error", "Error al denunciar");
                return BadRequest(ModelState);
            }
            var denuncia = new DenunciaModel
            {
                Tipo = vc.Tipo,
                HiloId = vc.HiloId,
                ComentarioId = vc.ComentarioId,
                Motivo = vc.Motivo,
                Aclaracion = vc.Aclaracion,
            };
            if (denuncia.ComentarioId == "") denuncia.ComentarioId = null;
            denuncia.Id = hashService.Random();
            if (await context.Hilos.AnyAsync(h => h.Id == denuncia.HiloId && h.Estado == HiloEstado.Eliminado))
            {
                ModelState.AddModelError("hilo", "No se encontro el hilo");
            }
            bool yaDenuncio = await context.Denuncias
                .AnyAsync(d => d.UsuarioId == (User.GetId() ?? "Anonimo") &&
                    d.Tipo == denuncia.Tipo && denuncia.HiloId == d.HiloId && d.ComentarioId == denuncia.ComentarioId);

            string ip = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
            yaDenuncio = yaDenuncio || denunciasIp.Contains(vc.HiloId + (vc.ComentarioId ?? "") + ip);

            if (yaDenuncio) ModelState.AddModelError("hilo", "Ya fue denunciado");

            if (User != null)
            {

                denuncia.UsuarioId = User.GetId();
            }
            if (!ModelState.IsValid) return BadRequest(ModelState);

            denuncia.Estado = EstadoDenuncia.NoRevisada;
            context.Denuncias.Add(denuncia);

            await context.SaveChangesAsync();

            denunciasIp.Add(vc.HiloId + (vc.ComentarioId ?? "") + ip);

            //Mandar denuncia a los medz
            denuncia = await context.Denuncias
                .Include(d => d.Hilo)
                .Include(d => d.Usuario)
                .Include(d => d.Comentario)
                .Include(d => d.Comentario.Media)
                .Include(d => d.Comentario.Audio)
                .Include(d => d.Comentario.Usuario)
                .Include(d => d.Hilo.Media)
                .Include(d => d.Hilo.Audio)
                .Include(d => d.Hilo.Usuario)
                .SingleAsync(d => d.Id == denuncia.Id);

            await rchanHub.Clients.Group("moderacion").SendAsync("nuevaDenuncia", new
            {
                Hilo = new HiloViewModelMod(denuncia.Hilo) { Usuario = new UsuarioModel { UserName = denuncia.Hilo.Usuario.UserName, Id = denuncia.Hilo.Usuario.Id } },
                Comentario = denuncia.Comentario != null ? new ComentarioViewModelMod(denuncia.Comentario)
                {
                    Usuario = new UsuarioModel { Id = denuncia.Comentario.Usuario.Id, UserName = denuncia.Comentario.Usuario.UserName }
                } : null,
                denuncia.Estado,
                denuncia.Aclaracion,
                denuncia.Id,
                denuncia.Tipo,
                denuncia.UsuarioId,
                denuncia.Motivo,
                denuncia.Creacion,
                denuncia.HiloId,
                denuncia.ComentarioId,
                Usuario = new
                {
                    denuncia.Usuario.UserName,
                    denuncia.Usuario.Id,
                }
            });


            return new ApiResponse("Denuncia enviada");
        }

        async private Task<ActionResult<ApiResponse>> AutoDenunciar(DenunciaVM vc)
        {
            var denuncia = new DenunciaModel
            {
                Tipo = vc.Tipo,
                HiloId = vc.HiloId,
                ComentarioId = vc.ComentarioId,
                Motivo = vc.Motivo,
                Aclaracion = vc.Aclaracion,
            };

            denuncia.Id = hashService.Random();
            denuncia.UsuarioId = "6dc9e3f2-3bdb-4c0d-8370-01c926ab454a";
            if (!ModelState.IsValid) return BadRequest(ModelState);
            denuncia.Estado = EstadoDenuncia.NoRevisada;
            context.Denuncias.Add(denuncia);
            await context.SaveChangesAsync();

            //Mandar denuncia a los medz
            denuncia = await context.Denuncias
                .Include(d => d.Hilo)
                .Include(d => d.Usuario)
                .Include(d => d.Comentario)
                .Include(d => d.Comentario.Media)
                .Include(d => d.Comentario.Usuario)
                .Include(d => d.Hilo.Media)
                .Include(d => d.Hilo.Usuario)
                .SingleAsync(d => d.Id == denuncia.Id);

            await rchanHub.Clients.Group("moderacion").SendAsync("nuevaDenuncia", new
            {
                Hilo = new HiloViewModelMod(denuncia.Hilo) { Usuario = new UsuarioModel { UserName = denuncia.Hilo.Usuario.UserName, Id = denuncia.Hilo.Usuario.Id } },
                Comentario = denuncia.Comentario != null ? new ComentarioViewModelMod(denuncia.Comentario)
                {
                    Usuario = new UsuarioModel { Id = denuncia.Comentario.Usuario.Id, UserName = denuncia.Comentario.Usuario.UserName }
                } : null,
                denuncia.Estado,
                denuncia.Aclaracion,
                denuncia.Id,
                denuncia.Tipo,
                denuncia.UsuarioId,
                denuncia.Motivo,
                denuncia.Creacion,
                denuncia.HiloId,
                denuncia.ComentarioId,
                Usuario = new
                {
                    denuncia.Usuario.UserName,
                    denuncia.Usuario.Id,
                }
            });

            return new ApiResponse("Denuncia enviada");
        }

        [AllowAnonymous]
        async public Task<ActionResult> CargarMas([FromQuery] DateTimeOffset ultimoBump, [FromQuery] DateTimeOffset ultimoCreacion, [FromQuery] string categorias, [FromQuery] bool serios = false, [FromQuery] bool nuevos = false)
        {
            var categoriasActivas = categorias.Split(",").Select(c => Convert.ToInt32(c)).ToHashSet();
            var ocultos = (await context.HiloAcciones
                .Where(a => a.UsuarioId == User.GetId() && a.Hideado)
                .Select(a => a.HiloId)
                .ToArrayAsync())
                .ToHashSet();
            // var hilos = await context.Hilos
            //     .AsNoTracking()
            //     .OrdenadosPorBump()
            //     .FiltrarNoActivos()
            //     .FiltrarOcultosDeUsuario(User.GetId(), context)
            //     .FiltrarPorCategoria(categoriasActivas)
            //     .Where(h => !context.Stickies.Any(s => s.HiloId == h.Id && !s.Global))
            //     .Where(h => h.Bump < ultimoBump)
            //     .Where(h => !serios || h.Flags.Contains("s"))
            //     .Take(16)
            //     .AViewModel(context)
            //     .ToListAsync();
            IEnumerable<HiloViewModel> hilos;

            if (nuevos)
            {
                hilos = rchanCacheService.hilosIndex
                    .Select((h, index) => new { h, index })
                    .OrderBy(a => rchanCacheService.creacionIndex[a.index])
                    .Select(a => a.h)
                    .Where(h => categoriasActivas.Contains(h.CategoriaId) && !ocultos.Contains(h.Id) && h.Sticky == 0)
                    .Where(h => h.Creacion < ultimoCreacion)
                    .Take(16);
            }
            else
            {
                hilos = rchanCacheService.hilosIndex
                    .Where(h => categoriasActivas.Contains(h.CategoriaId) && !ocultos.Contains(h.Id) && h.Sticky == 0)
                    .Where(h => h.Bump < ultimoBump)
                    .Where(h => !serios || h.Serio)
                    .Take(16);
            }

            return Ok(hilos);
        }
        [AllowAnonymous]
        async public Task<ActionResult> Buscar(string busqueda = "")
        {
            if (string.IsNullOrWhiteSpace(busqueda)) busqueda = "";
            busqueda = string.Join("", busqueda.Take(15));
            var resultados = await context.Hilos
                .AsNoTracking()
                .FiltrarNoActivos()
                .Where(h => EF.Functions.ILike(h.Titulo, $"%{busqueda}%"))
                .OrdenadosPorBump()
                .Take(32)
                .AViewModel(context)
                .ToListAsync();
            resultados.ForEach(h => h.Contenido = "");

            return Ok(resultados);
        }

        private ActionResult AgregarEncuesta(CrearHiloViewModel vc, HiloModel hilo)
        {
            string[] opcionesEncuesta = null;
            try
            {
                opcionesEncuesta = JsonConvert.DeserializeObject<string[]>(vc.Encuesta);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                ModelState.AddModelError("", "No se pudeo agregar la encuesta");
                return BadRequest(ModelState);
            }
            if (opcionesEncuesta.Length < 2)
            {
                hilo.Encuesta = null;
                return null;
            }
            if (opcionesEncuesta.Length >= 10)
            {
                ModelState.AddModelError("", "El maximo de opciones para una encuesta des de 10");
                return BadRequest(ModelState);
            }
            if (opcionesEncuesta.Where(o => o.Length > 64).Any())
            {
                ModelState.AddModelError("", "Las opcione de la encuesta no puede tener mas de 32 caracteres");
                return BadRequest(ModelState);
            }

            var encuesta = new Encuesta
            {
                Opciones = opcionesEncuesta.Select(o => new OpcionEncuesta { Nombre = o, Votos = 0 }).ToList()
            };

            hilo.Encuesta = encuesta;
            return null;
        }

        public class VotarEncuestaVm
        {
            public string HiloId { get; set; } = "";
            public string Opcion { get; set; } = "";
        }
        async public Task<ActionResult> VotarEncuesta(VotarEncuestaVm model)
        {
            var hilo = await context.Hilos.PorId(model.HiloId);

            if (hilo is null || hilo.Encuesta is null)
            {
                ModelState.AddModelError("jeje", "No se encontro la encuesta");
                return BadRequest(ModelState);
            }

            string ip = HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();

            if (hilo.Encuesta.Ids.Contains(User.GetId()) || hilo.Encuesta.Ips.Contains(ip))
            {
                ModelState.AddModelError("Ay", "Usted ya ha votado");
                return BadRequest(ModelState);
            }

            if (!hilo.Encuesta.Opciones.Any(o => o.Nombre == model.Opcion))
            {
                ModelState.AddModelError("Ay", "No se encontro la opcion");
                return BadRequest(ModelState);
            }

            hilo.Encuesta.Opciones.FirstOrDefault(o => o.Nombre == model.Opcion).Votos++;
            hilo.Encuesta.Ids.Add(User.GetId());
            hilo.Encuesta.Ips.Add(ip);

            context.Update(hilo);
            await context.SaveChangesAsync();

            return Ok(new ApiResponse("Encuesta votada"));
        }

        [Authorize("esMod")]
        [HttpPost]
        async public Task<ActionResult> ToggleHistorico(AccionVM model)
        {
            var hilo = await context.Hilos.PorId(model.HiloId);
            if (hilo is null) return NotFound();

            if (hilo.Flags.Contains("h")) hilo.Flags = hilo.Flags.Replace("h", "");
            else hilo.Flags += "h";

            return Ok();
        }

        [AllowAnonymous]
        async public Task<ActionResult> Todos()
        {
            return Ok(rchanCacheService.hilosIndex.Take(160));
        }

    }


    public class ApiResponse
    {
        public bool Success { get; set; }
        public string Mensaje { get; set; }
        public dynamic Value { get; set; }

        public ApiResponse(string mensaje = "", bool success = true, dynamic value = null)
        {
            this.Success = success;
            this.Mensaje = mensaje;
            this.Value = value;

        }

    }

    public class AccionVM
    {
        public string HiloId { get; set; }
        public string Accion { get; set; }
    }

    public class DenunciaVM
    {
        [Required]
        public TipoElemento Tipo { get; set; }
        [Required]
        public string HiloId { get; set; }
        public string ComentarioId { get; set; }
        [Required, Range(0, 10, ErrorMessage = "Seleccione un motivo padre")]
        public MotivoDenuncia Motivo { get; set; }
        public string Aclaracion { get; set; } = "";
        public string Captcha { get; set; } = "";
    }

}
