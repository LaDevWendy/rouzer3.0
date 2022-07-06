using Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Modelos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using WebApp;

namespace Servicios
{
    public interface IBotService
    {
        public Task<bool> EjecutarComando(string comando, HiloModel hilo, ComentarioModel comentario);
    }

    public abstract class BotService : ContextService, IBotService
    {
        protected readonly IHubContext<RChanHub> rchanHub;
        protected readonly IComentarioService comentarioService;
        protected readonly UserManager<UsuarioModel> userManager;
        protected readonly NotificacionesService notificacionesService;
        public BotService(IHubContext<RChanHub> rchanHub,
            IComentarioService comentarioService,
            NotificacionesService notificacionesService,
            UserManager<UsuarioModel> userManager,
            RChanContext context,
            HashService hashService) : base(context, hashService)
        {
            this.rchanHub = rchanHub;
            this.comentarioService = comentarioService;
            this.notificacionesService = notificacionesService;
            this.userManager = userManager;
        }
        public abstract Task<bool> EjecutarComando(string comando, HiloModel hilo, ComentarioModel comentario);
        protected abstract Task<bool> Ayudar(string comando, HiloModel hilo, ComentarioModel comentario);
        protected async Task EnviarComentario(HiloModel hilo, ComentarioModel comentario)
        {
            await comentarioService.Guardar(comentario, false);
            var model = new ComentarioViewModel(comentario, hilo);
            await rchanHub.Clients.Group(hilo.Id).SendAsync("NuevoComentario", model);
            await rchanHub.Clients.Group("home").SendAsync("HiloComentado", hilo.Id, comentario.Contenido);
            await notificacionesService.Notificar(hilo, comentario);
        }
        protected async Task InformarComandoInvalido(string comando, HiloModel hilo, ComentarioModel comentario)
        {
            var rouzedBot = (await userManager.GetUsersForClaimAsync(new Claim("Role", "bot"))).FirstOrDefault();
            var respuesta = new ComentarioModel
            {
                Contenido = $">>{comentario.Id}\n" +
                $"Comando inválido.",
                Nombre = rouzedBot.UserName,
                Rango = CreacionRango.Bot,
                Usuario = rouzedBot,
                HiloId = hilo.Id
            };
            await EnviarComentario(hilo, respuesta);
        }

    }

    public class LobbyService : BotService
    {
        private readonly DueloService dueloService;
        private readonly RuletaService ruletaService;

        public LobbyService(
            PremiumService premiumService,
            IHubContext<RChanHub> rchanHub,
            IComentarioService comentarioService,
            NotificacionesService notificacionesService,
            UserManager<UsuarioModel> userManager,
            RChanContext context,
            HashService hashService) : base(rchanHub, comentarioService, notificacionesService, userManager, context, hashService)
        {
            this.dueloService = new DueloService(premiumService, rchanHub, comentarioService, notificacionesService, userManager, context, hashService);
            this.ruletaService = new RuletaService(premiumService, rchanHub, comentarioService, notificacionesService, userManager, context, hashService);
        }

        public override async Task<bool> EjecutarComando(string comando, HiloModel hilo, ComentarioModel comentario)
        {
            var match = Regex.Match(comando, @"^!duelo", RegexOptions.Multiline);
            if (match.Success)
            {
                var res = await dueloService.EjecutarComando(comando, hilo, comentario);
                if (!res)
                {
                    await InformarComandoInvalido(comando, hilo, comentario);
                }
                return true;
            }
            match = Regex.Match(comando, @"^!ruleta", RegexOptions.Multiline);
            if (match.Success)
            {
                var res = await ruletaService.EjecutarComando(comando, hilo, comentario);
                if (!res)
                {
                    await InformarComandoInvalido(comando, hilo, comentario);
                }
                return true;
            }
            match = Regex.Match(comando, @"^!juegos", RegexOptions.Multiline);
            if (match.Success)
            {
                var res = await Ayudar(comando, hilo, comentario);
                if (!res)
                {
                    await InformarComandoInvalido(comando, hilo, comentario);
                }
                return true;
            }
            return false;
        }

        protected override async Task<bool> Ayudar(string comando, HiloModel hilo, ComentarioModel comentario)
        {
            var rouzedBot = (await userManager.GetUsersForClaimAsync(new Claim("Role", "bot"))).FirstOrDefault();
            var respuesta = new ComentarioModel
            {
                Contenido = $">>{comentario.Id}\n" +
                $">Juegos disponibles:\n" +
                $"Duelo y Ruleta\n\n" +
                $">Duelo\n" +
                $"!duelo ayuda\n\n" +
                $">Ruleta\n" +
                $"!ruleta ayuda\n\n",
                Nombre = rouzedBot.UserName,
                Rango = CreacionRango.Bot,
                Usuario = rouzedBot,
                HiloId = hilo.Id
            };
            await EnviarComentario(hilo, respuesta);
            return true;
        }

        public async Task ResolverJuegos()
        {
            var ahora = DateTimeOffset.Now;
            var juegos = await _context.Juegos.Where(j => j.Estado == JuegoEstado.Abierto)
                .Where(j => j.Expiracion < ahora)
                .ToListAsync();
            foreach (var j in juegos)
            {
                if (j.Tipo == TipoJuego.Duelo)
                {
                    await dueloService.ResolverJuego(j);
                }
                if (j.Tipo == TipoJuego.Ruleta)
                {
                    await ruletaService.ResolverJuego(j);
                }
            }
        }
    }

    public abstract class JuegoService : BotService
    {
        protected readonly PremiumService premiumService;
        public JuegoService(PremiumService premiumService,
            IHubContext<RChanHub> rchanHub,
            IComentarioService comentarioService,
            NotificacionesService notificacionesService,
            UserManager<UsuarioModel> userManager,
            RChanContext context,
            HashService hashService) : base(rchanHub, comentarioService, notificacionesService, userManager, context, hashService)
        {
            this.premiumService = premiumService;
        }

        public async Task ResolverJuego(JuegoModel juego)
        {
            var rouzedBot = (await userManager.GetUsersForClaimAsync(new Claim("Role", "bot"))).FirstOrDefault();
            var apuestas = await _context.Apuestas.AsNoTracking().Where(a => a.JuegoId == juego.Id).ToListAsync();
            var nParticipantes = apuestas.Select(a => a.UsuarioId).Distinct().Count();
            var hilo = await _context.Hilos.Include(h => h.Media).FirstOrDefaultAsync(h => h.Id == juego.HiloId);

            if (nParticipantes < juego.NumeroParticipantesMinimo)
            {
                var respuesta = new ComentarioModel
                {
                    Nombre = rouzedBot.UserName,
                    Rango = CreacionRango.Bot,
                    Usuario = rouzedBot,
                    HiloId = juego.HiloId
                };

                foreach (var a in apuestas)
                {
                    var balance = await premiumService.ActualizarBalanceAsync(a.UsuarioId, a.Cantidad);
                    await premiumService.RegistrarReembolsoAsync(a.UsuarioId, balance.Balance, 1, "Apuesta", a.Cantidad, "RouzCoins");
                    respuesta.Contenido += $">>{a.ComentarioId}\n";
                }

                respuesta.Contenido += $"No se alcanza número mínimo de participantes: {nParticipantes}\n" +
                    $"Se procede al reembolso de las apuestas.";
                await EnviarComentario(hilo, respuesta);
            }
            else
            {
                var random = new Random();
                var apuestasValidas = juego.ApuestasValidas;
                var ApuestasIgnoradasAlResolver = juego.ApuestasIgnoradasAlResolver;
                int ganador = apuestasValidas[random.Next(apuestasValidas.Length)];

                var respuesta = new ComentarioModel
                {
                    Nombre = rouzedBot.UserName,
                    Rango = CreacionRango.Bot,
                    Usuario = rouzedBot,
                    HiloId = juego.HiloId
                };

                respuesta.Contenido = $"Número ganador: {ganador}\n";

                foreach (var a in apuestas)
                {
                    var numeros = a.Apuesta.Split(",").Select(int.Parse).ToList();
                    if (numeros.Contains(ganador))
                    {
                        float nTotal = apuestasValidas.Length;
                        float n = numeros.Count;
                        var tasa = (nTotal / n) * (juego.Bonus + (nTotal - n) / nTotal) + 1f;
                        var balance = await premiumService.ActualizarBalanceAsync(a.UsuarioId, tasa * a.Cantidad);
                        await premiumService.RegistrarGananciaAsync(a.UsuarioId, 1, tasa * a.Cantidad, balance.Balance);
                        respuesta.Contenido += $">>{a.ComentarioId}\nHa ganado {Math.Round(((tasa - 1) * a.Cantidad) * 10f) / 10f}\n";
                    }
                    else
                    {
                        respuesta.Contenido += $">>{a.ComentarioId}\nHa perdido {a.Cantidad}\n";
                    }
                }
                await EnviarComentario(hilo, respuesta);
            }
            juego.Estado = JuegoEstado.Cerrado;
            await _context.SaveChangesAsync();
        }

    }

    public class DueloService : JuegoService
    {
        public DueloService(PremiumService premiumService,
            IHubContext<RChanHub> rchanHub,
            IComentarioService comentarioService,
            NotificacionesService notificacionesService,
            UserManager<UsuarioModel> userManager,
            RChanContext context,
            HashService hashService) : base(premiumService, rchanHub, comentarioService, notificacionesService, userManager, context, hashService)
        {

        }
        public override async Task<bool> EjecutarComando(string comando, HiloModel hilo, ComentarioModel comentario)
        {
            var match = Regex.Match(comando, @"^!duelo\s+([0-9]+)", RegexOptions.Multiline);
            if (match.Success)
            {
                var cantidad = float.Parse(match.Groups[1].Value);
                return await EmpezarDuelo(cantidad, hilo, comentario);
            }
            match = Regex.Match(comando, @"^!duelo\s+(aceptar)", RegexOptions.Multiline);
            if (match.Success)
            {
                return await AceptarDuelo(comando, hilo, comentario);
            }
            match = Regex.Match(comando, @"^!duelo\s+(ayuda)", RegexOptions.Multiline);
            if (match.Success)
            {
                return await Ayudar(match.Groups[1].Value, hilo, comentario);
            }
            return false;
        }

        protected override async Task<bool> Ayudar(string comando, HiloModel hilo, ComentarioModel comentario)
        {
            var rouzedBot = (await userManager.GetUsersForClaimAsync(new Claim("Role", "bot"))).FirstOrDefault();
            var respuesta = new ComentarioModel
            {
                Contenido = $">>{comentario.Id}\n" +
                $">Implementación del juego cara o seca.\n" +
                $"Un anon inicia el duelo con una cantidad apostada y el duelo se resuelve con el primer anon que responda el comentario aceptándolo\n\n" +
                $">Comandos válidos del duelo:\n\n" +
                $"!duelo [cantidad]\n" +
                $"para iniciar un duelo, donde [cantidad] es la cantidad apostada, por ejemplo:\n" +
                $"!duelo 100\n\n" +
                $"!duelo aceptar" +
                $"\npara aceptar un duelo, se tiene que citar un comentario con un duelo iniciado, " +
                $"por ejemplo si el comentario I50YL4R4 tiene un duelo iniciado (y no resuelto) entonces:\n" +
                $"\n>>I50YL4R4\n!duelo aceptar\n\n" +
                $"de esa forma se acepta el duelo y automáticamente se resuelve.\n\n" +
                $"Si pasan 5 minutos y nadie acepta el duelo la cantidad apostada será reembolsada\n\n" +
                $"Bonus:\n" +
                $"Las apuestas ganadas tienen un bonus del 1% del valor de la apuesta.",
                Nombre = rouzedBot.UserName,
                Rango = CreacionRango.Bot,
                Usuario = rouzedBot,
                HiloId = hilo.Id
            };
            await EnviarComentario(hilo, respuesta);
            return true;
        }

        private async Task<bool> EmpezarDuelo(float cantidad, HiloModel hilo, ComentarioModel comentario)
        {
            var rouzedBot = (await userManager.GetUsersForClaimAsync(new Claim("Role", "bot"))).FirstOrDefault();

            if (!(cantidad > 0))
            {
                var resp = new ComentarioModel
                {
                    Contenido = $">>{comentario.Id} \nLa cantidad apostada debe ser mayor o igual a 1 (solo se aceptan número enteros).",
                    Nombre = rouzedBot.UserName,
                    Rango = CreacionRango.Bot,
                    Usuario = rouzedBot,
                    HiloId = hilo.Id
                };
                await EnviarComentario(hilo, resp);
                return true;
            }

            var balance = await premiumService.ObtenerBalanceAsync(comentario.UsuarioId);
            if (balance.Balance < cantidad)
            {
                var resp = new ComentarioModel
                {
                    Contenido = $">>{comentario.Id} \nNo tienes suficientes RouzCoins para iniciar un duelo por esa cantidad.",
                    Nombre = rouzedBot.UserName,
                    Rango = CreacionRango.Bot,
                    Usuario = rouzedBot,
                    HiloId = hilo.Id
                };
                await EnviarComentario(hilo, resp);
                return true;
            }

            var duelo = new JuegoModel
            {
                Id = hashService.Random(),
                HiloId = hilo.Id,
                Tipo = TipoJuego.Duelo
            };

            var apuesta = new ApuestaModel
            {
                Id = hashService.Random(),
                JuegoId = duelo.Id,
                UsuarioId = comentario.UsuarioId,
                ComentarioId = comentario.Id,
                Cantidad = cantidad,
                Apuesta = "0"
            };

            balance = await premiumService.ActualizarBalanceAsync(comentario.UsuarioId, -apuesta.Cantidad);
            var id = await premiumService.RegistrarApuestaAsync(apuesta.UsuarioId, apuesta.Cantidad, balance.Balance);
            apuesta.TransaccionId = id;
            _context.Add(duelo);
            _context.Add(apuesta);
            await _context.SaveChangesAsync();


            var respuesta = new ComentarioModel
            {
                Contenido = $">>{comentario.Id}\n" +
                $"Duelo iniciado.\n" +
                $"Si nadie lo acepta en 5 minutos será cancelado y lo apostado se te será reembolsado.",
                Nombre = rouzedBot.UserName,
                Rango = CreacionRango.Bot,
                Usuario = rouzedBot,
                HiloId = hilo.Id
            };
            await EnviarComentario(hilo, respuesta);

            return true;
        }

        private async Task<bool> AceptarDuelo(string comando, HiloModel hilo, ComentarioModel comentario)
        {
            var rouzedBot = (await userManager.GetUsersForClaimAsync(new Claim("Role", "bot"))).FirstOrDefault();

            var comentariosTageados = comentarioService.GetIdsTageadas(comando);
            var apuesta = await _context.Apuestas.Include(a => a.Juego)
                .Where(a => comentariosTageados.Any(id => a.ComentarioId == id))
                .Where(a => a.Juego.Tipo == TipoJuego.Duelo)
                .Where(a => a.Juego.Estado == JuegoEstado.Abierto)
                .FirstOrDefaultAsync();

            if (apuesta is null)
            {
                var respuesta = new ComentarioModel
                {
                    Contenido = $">>{comentario.Id} \nNo estás respondiendo a ningún duelo abierto.",
                    Nombre = rouzedBot.UserName,
                    Rango = CreacionRango.Bot,
                    Usuario = rouzedBot,
                    HiloId = hilo.Id
                };
                await EnviarComentario(hilo, respuesta);
                return true;
            }

            if (comentario.UsuarioId == apuesta.UsuarioId)
            {
                var respuesta = new ComentarioModel
                {
                    Contenido = $">>{comentario.Id} \nNo puedes aceptar tu propio duelo.",
                    Nombre = rouzedBot.UserName,
                    Rango = CreacionRango.Bot,
                    Usuario = rouzedBot,
                    HiloId = hilo.Id
                };
                await EnviarComentario(hilo, respuesta);
                return true;
            }

            var balance = await premiumService.ObtenerBalanceAsync(comentario.UsuarioId);
            if (balance.Balance < apuesta.Cantidad)
            {
                var respuesta = new ComentarioModel
                {
                    Contenido = $">>{comentario.Id} \nNo tienes suficientes RouzCoins para aceptar el duelo.",
                    Nombre = rouzedBot.UserName,
                    Rango = CreacionRango.Bot,
                    Usuario = rouzedBot,
                    HiloId = hilo.Id
                };
                await EnviarComentario(hilo, respuesta);
                return true;
            }

            var nuevaApuesta = new ApuestaModel
            {
                Id = hashService.Random(),
                JuegoId = apuesta.JuegoId,
                UsuarioId = comentario.UsuarioId,
                ComentarioId = comentario.Id,
                Cantidad = apuesta.Cantidad,
                Apuesta = "1"
            };

            balance = await premiumService.ActualizarBalanceAsync(comentario.UsuarioId, -nuevaApuesta.Cantidad);
            var id = await premiumService.RegistrarApuestaAsync(nuevaApuesta.UsuarioId, nuevaApuesta.Cantidad, balance.Balance);
            nuevaApuesta.TransaccionId = id;
            _context.Add(nuevaApuesta);
            await _context.SaveChangesAsync();

            await ResolverJuego(apuesta.Juego);

            return true;
        }
    }

    public class RuletaService : JuegoService
    {
        public RuletaService(PremiumService premiumService,
            IHubContext<RChanHub> rchanHub,
            IComentarioService comentarioService,
            NotificacionesService notificacionesService,
            UserManager<UsuarioModel> userManager,
            RChanContext context,
            HashService hashService) : base(premiumService, rchanHub, comentarioService, notificacionesService, userManager, context, hashService)
        {

        }

        public override async Task<bool> EjecutarComando(string comando, HiloModel hilo, ComentarioModel comentario)
        {
            var match = Regex.Match(comando, @"^!ruleta\s+([a-z]+[1-3]{0,1}|[0-9]{1,2})\s+([0-9]+)", RegexOptions.Multiline);
            if (match.Success)
            {
                var apuesta = match.Groups[1].Value;
                var cantidad = float.Parse(match.Groups[2].Value);
                return await Apostar(apuesta, cantidad, hilo, comentario);
            }
            match = Regex.Match(comando, @"^!ruleta\s+(girar)", RegexOptions.Multiline);
            if (match.Success)
            {
                return await Girar(match.Groups[1].Value, hilo, comentario);
            }
            match = Regex.Match(comando, @"^!ruleta\s+(ayuda)", RegexOptions.Multiline);
            if (match.Success)
            {
                return await Ayudar(match.Groups[1].Value, hilo, comentario);
            }
            return false;
        }

        private async Task<bool> Apostar(string comando, float cantidad, HiloModel hilo, ComentarioModel comentario)
        {
            var rouzedBot = (await userManager.GetUsersForClaimAsync(new Claim("Role", "bot"))).FirstOrDefault();

            var match = Regex.Match(comando, @"^(par|impar|rojo|negro|medio1|medio2|docena1|docena2|docena3|columna1|columna2|columna3|[0-9]{1,2})$");
            if (!match.Success)
            {
                return false;
            }

            string numeros;
            var success = int.TryParse(match.Groups[1].Value, out int numero);
            if (success)
            {
                if (numero > 36)
                {
                    var resp = new ComentarioModel
                    {
                        Contenido = $">>{comentario.Id}\n" +
                        $"El número máximo es 36.",
                        Nombre = rouzedBot.UserName,
                        Rango = CreacionRango.Bot,
                        Usuario = rouzedBot,
                        HiloId = hilo.Id
                    };
                    await EnviarComentario(hilo, resp);
                    return true;
                }
                numeros = $"{numero}";
            }
            else
            {
                switch (match.Groups[1].Value)
                {
                    case "par":
                        numeros = "2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36";
                        break;
                    case "impar":
                        numeros = "1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35";
                        break;
                    case "rojo":
                        numeros = "1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36";
                        break;
                    case "negro":
                        numeros = "2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35";
                        break;
                    case "medio1":
                        numeros = "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18";
                        break;
                    case "medio2":
                        numeros = "19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36";
                        break;
                    case "docena1":
                        numeros = "1,2,3,4,5,6,7,8,9,10,11,12";
                        break;
                    case "docena2":
                        numeros = "13,14,15,16,17,18,19,20,21,22,23,24";
                        break;
                    case "docena3":
                        numeros = "25,26,27,28,29,30,31,32,33,34,35,36";
                        break;
                    case "columna1":
                        numeros = "1,4,7,10,13,16,19,22,25,28,31,34";
                        break;
                    case "columna2":
                        numeros = "2,5,8,11,14,17,20,23,26,29,32,35";
                        break;
                    case "columna3":
                        numeros = "3,6,9,12,15,18,21,24,27,30,33,36";
                        break;
                    default:
                        return false;
                }
            }

            if (!(cantidad > 0))
            {
                var resp = new ComentarioModel
                {
                    Contenido = $">>{comentario.Id} \nLa cantidad apostada debe ser mayor o igual a 1 (solo se aceptan números enteros).",
                    Nombre = rouzedBot.UserName,
                    Rango = CreacionRango.Bot,
                    Usuario = rouzedBot,
                    HiloId = hilo.Id
                };
                await EnviarComentario(hilo, resp);
                return true;
            }

            var balance = await premiumService.ObtenerBalanceAsync(comentario.UsuarioId);
            if (balance.Balance < cantidad)
            {
                var resp = new ComentarioModel
                {
                    Contenido = $">>{comentario.Id} \nNo tienes suficientes RouzCoins para iniciar un duelo por esa cantidad.",
                    Nombre = rouzedBot.UserName,
                    Rango = CreacionRango.Bot,
                    Usuario = rouzedBot,
                    HiloId = hilo.Id
                };
                await EnviarComentario(hilo, resp);
                return true;
            }

            var ruleta = await _context.Juegos.Where(j => j.HiloId == hilo.Id)
                .Where(j => j.Tipo == TipoJuego.Ruleta)
                .Where(j => j.Estado == JuegoEstado.Abierto)
                .FirstOrDefaultAsync();

            bool nuevaRuleta = false;
            if (ruleta is null)
            {
                nuevaRuleta = true;
                ruleta = new JuegoModel
                {
                    Id = hashService.Random(),
                    HiloId = hilo.Id,
                    Tipo = TipoJuego.Ruleta
                };
                _context.Add(ruleta);
            }

            var apuestaVieja = await _context.Apuestas.FirstOrDefaultAsync(a => a.JuegoId == ruleta.Id && a.UsuarioId == comentario.UsuarioId);

            if (!(apuestaVieja is null)){
                var resp = new ComentarioModel
                {
                    Contenido = $">>{comentario.Id} \nSolo una apuesta por usuario por ruleta.",
                    Nombre = rouzedBot.UserName,
                    Rango = CreacionRango.Bot,
                    Usuario = rouzedBot,
                    HiloId = hilo.Id
                };
                await EnviarComentario(hilo, resp);
                return true;
            }

            var apuesta = new ApuestaModel
            {
                Id = hashService.Random(),
                JuegoId = ruleta.Id,
                UsuarioId = comentario.UsuarioId,
                ComentarioId = comentario.Id,
                Cantidad = cantidad,
                Apuesta = numeros
            };

            balance = await premiumService.ActualizarBalanceAsync(comentario.UsuarioId, -apuesta.Cantidad);
            var id = await premiumService.RegistrarApuestaAsync(apuesta.UsuarioId, apuesta.Cantidad, balance.Balance);
            apuesta.TransaccionId = id;
            _context.Add(apuesta);
            await _context.SaveChangesAsync();

            var nuevaRuletaCadena = "";
            if (nuevaRuleta)
            {
                nuevaRuletaCadena = ">Nueva ruleta\n" +
                    "Se ha iniciado una nueva ruleta\n" +
                    "Si el OP no la hace girar en 5 minutos se resolverá automáticamente\n\n";
            }
            var respuesta = new ComentarioModel
            {
                Contenido = $">>{comentario.Id}\n" +
                nuevaRuletaCadena +
                $"Se ha agregado tu apuesta a la ruleta.",
                Nombre = rouzedBot.UserName,
                Rango = CreacionRango.Bot,
                Usuario = rouzedBot,
                HiloId = hilo.Id
            };
            await EnviarComentario(hilo, respuesta);
            return true;
        }
        private async Task<bool> Girar(string comando, HiloModel hilo, ComentarioModel comentario)
        {
            var rouzedBot = (await userManager.GetUsersForClaimAsync(new Claim("Role", "bot"))).FirstOrDefault();

            if (comentario.UsuarioId != hilo.UsuarioId)
            {
                var resp = new ComentarioModel
                {
                    Contenido = $">>{comentario.Id} \nNo sos el OP.",
                    Nombre = rouzedBot.UserName,
                    Rango = CreacionRango.Bot,
                    Usuario = rouzedBot,
                    HiloId = hilo.Id
                };
                await EnviarComentario(hilo, resp);
                return true;
            }

            var ruleta = await _context.Juegos.Where(j => j.HiloId == hilo.Id)
                .Where(j => j.Tipo == TipoJuego.Ruleta)
                .Where(j => j.Estado == JuegoEstado.Abierto)
                .FirstOrDefaultAsync();

            if (ruleta is null)
            {
                var resp = new ComentarioModel
                {
                    Contenido = $">>{comentario.Id} \nNo hay una ruleta abierta en este roz.",
                    Nombre = rouzedBot.UserName,
                    Rango = CreacionRango.Bot,
                    Usuario = rouzedBot,
                    HiloId = hilo.Id
                };
                await EnviarComentario(hilo, resp);
                return true;
            }

            await ResolverJuego(ruleta);
            return true;
        }

        protected override async Task<bool> Ayudar(string comando, HiloModel hilo, ComentarioModel comentario)
        {
            var rouzedBot = (await userManager.GetUsersForClaimAsync(new Claim("Role", "bot"))).FirstOrDefault();
            var media = await _context.Medias.FirstOrDefaultAsync(m => m.Id == "Ruleta_Media_Id");
            var respuesta = new ComentarioModel
            {
                Contenido = $">>{comentario.Id}\n" +
                $">Implementación de la ruleta europea\n" +
                $"La ronda de apuestas inicia cuando un anon realiza una apuesta en la ruleta.\n" +
                $"La ronda de apuestas termina cuando el OP hace girar la ruleta, o en su defecto 5 minutos después de la primera apuesta.\n\n" +
                $">Comandos válidos\n" +
                $"!ruleta [apuesta] [cantidad]\n" +
                $"donde [apuesta] es una apuesta válida y [cantidad] es la cantidad de RouzCoins a apostar.\n\n" +
                $"!ruleta girar\n" +
                $"el OP usa este comando para hacer girar la ruleta.\n\n" +
                $">Apuestas válidas\n" +
                $"Se pagan 1 a 1 las siguientes apuestas (+6.58% de bonus):\n" +
                $"par: números pares (excluido el 0)\n" +
                $"impar: número impares\n" +
                $"medio1: números del 1 al 18\n" +
                $"medio2: números del 19 al 36\n" +
                $"rojo: números rojos\n" +
                $"negro: números negros\n\n" +
                $"Se pagan 2 a 1 las siguientes apuestas (+9.87% de bonus):\n" +
                $"docena1: números del 1 al 12\n" +
                $"docena2: números del 13 al 24\n" +
                $"docena3: números del 25 al 36\n" +
                $"columna1: números de la primera columna (ver imagen)\n" +
                $"columna2: números de la segunda columna (ver imagen)\n" +
                $"columna3: números de la tercera columna (ver imagen)\n\n" +
                $"Se pagan 36 a 1 las siguientes apuestas (+18.50% de bonus):\n" +
                $"Cualquiera de los números, por ejemplo si quiero apostar 100 RouzCoins al número 12 será:\n" +
                $"!ruleta 12 100\n\n" +
                $"Solo una apuesta por usuario.",
                Nombre = rouzedBot.UserName,
                Rango = CreacionRango.Bot,
                Usuario = rouzedBot,
                HiloId = hilo.Id,
                Media = media
            };
            await EnviarComentario(hilo, respuesta);
            return true;
        }
    }
}
