using Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Modelos;
using SixLabors.ImageSharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using WebApp;

namespace Servicios
{
    public class PremiumService : ContextService
    {
        private readonly UserManager<UsuarioModel> userManager;
        private readonly IOptionsSnapshot<List<Categoria>> categoriasOpts;
        private readonly IOptionsSnapshot<List<AutoBump>> autoBumpOpts;
        private readonly IOptionsSnapshot<List<MensajeGlobal>> mensajeGlobalOpts;
        private readonly ILogger<PremiumService> logger;
        private readonly FormateadorService formateador;
        private readonly IHubContext<RChanHub> rchanHub;
        private string CarpetaDeComprobantes { get; } = "Comprobantes";
        public PremiumService(
            RChanContext context,
            HashService hashService,
            UserManager<UsuarioModel> userManager,
            IOptionsSnapshot<List<Categoria>> categoriasOpts,
            IOptionsSnapshot<List<AutoBump>> autoBumpOpts,
            IOptionsSnapshot<List<MensajeGlobal>> mensajeGlobalOpts,
            ILogger<PremiumService> logger,
            FormateadorService formateador,
            IHubContext<RChanHub> rchanHub) : base(context, hashService)
        {
            this.categoriasOpts = categoriasOpts;
            this.userManager = userManager;
            this.logger = logger;
            this.autoBumpOpts = autoBumpOpts;
            this.mensajeGlobalOpts = mensajeGlobalOpts;
            this.formateador = formateador;
            this.rchanHub = rchanHub;

        }
        public async Task<BalanceModel> ObtenerBalanceAsync(string id)
        {
            var balance = await _context.Balances.FirstOrDefaultAsync(b => b.Id == id);
            if (balance is null)
            {
                balance = new BalanceModel();
                balance.Id = id;
                balance.UsuarioId = id;
                _context.Balances.Add(balance);
                await _context.SaveChangesAsync();
            }
            return balance;
        }

        public async Task<BalanceModel> ActualizarBalanceAsync(string id, float cambio)
        {
            var balance = await ObtenerBalanceAsync(id);
            balance.Balance += cambio;
            if (balance.Balance < 0f)
            {
                balance.Balance = 0f;
            }
            await _context.SaveChangesAsync();
            return balance;
        }

        public async Task RegistrarAccionCP(string userId, string cpId, TipoAccionCP tipo)
        {
            var accionCP = new AccionCodigoPremiumModel
            {
                Id = hashService.Random(),
                UsuarioId = userId,
                CodigoPremiumId = cpId,
                Tipo = tipo
            };
            _context.AccionesCodigosPremium.Add(accionCP);
            await _context.SaveChangesAsync();
        }

        public async Task RegistrarActivacionAsync(string userId, float cantidad)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == userId);
            var regalo = new TransaccionModel
            {
                Id = hashService.Random(),
                OrigenCantidad = 1f,
                OrigenUnidad = "Código Premium",
                DestinoCantidad = cantidad,
                DestinoUnidad = "Días Premium",
                Tipo = TipoTransaccion.Compra,
                Usuario = usuario,
                Balance = -1
            };
            _context.Transacciones.Add(regalo);
            await _context.SaveChangesAsync();
        }

        public async Task RegistrarAgregarRouzCoinsAsync(string userId, float cantidad, float balance)
        {
            var regalo = new TransaccionModel
            {
                Id = hashService.Random(),
                OrigenCantidad = 1f,
                OrigenUnidad = "Código Premium",
                DestinoCantidad = cantidad,
                DestinoUnidad = "RouzCoins",
                Tipo = TipoTransaccion.Compra,
                UsuarioId = userId,
                Balance = balance
            };
            _context.Transacciones.Add(regalo);
            await _context.SaveChangesAsync();
        }

        public async Task RegistrarDonacionAsync(string donanteId, string receptorId, float cantidad, float balanceDonante, float balanceReceptor)
        {
            var donacion = new TransaccionModel
            {
                Id = hashService.Random(),
                OrigenCantidad = cantidad,
                OrigenUnidad = "RouzCoins",
                DestinoCantidad = cantidad,
                DestinoUnidad = "RouzCoins",
                Tipo = TipoTransaccion.HacerDonacion,
                UsuarioId = donanteId,
                Balance = balanceDonante
            };

            var recepcion = new TransaccionModel
            {
                Id = hashService.Random(),
                OrigenCantidad = cantidad,
                OrigenUnidad = "RouzCoins",
                DestinoCantidad = cantidad,
                DestinoUnidad = "RouzCoins",
                Tipo = TipoTransaccion.RecibirDonacion,
                UsuarioId = receptorId,
                Balance = balanceReceptor
            };

            _context.Transacciones.Add(donacion);
            _context.Transacciones.Add(recepcion);

            await _context.SaveChangesAsync();
        }

        public async Task<bool> CheckearAutobumpsHilo(string hiloId)
        {
            var autobump = await _context.AutoBumps.FirstOrDefaultAsync(a => a.HiloId == hiloId && a.Restante > 0);
            return (autobump is null);
        }
        public async Task<bool> CrearAutoBumpsAsync(string usuarioId, string hiloId, int tier)
        {
            if (await CheckearAutobumpsHilo(hiloId))
            {
                var ware = autoBumpOpts.Value.FirstOrDefault(w => w.Id == tier);
                var autobump = new AutoBumpModel
                {
                    Id = hashService.Random(),
                    UsuarioId = usuarioId,
                    HiloId = hiloId,
                    Restante = ware.Duracion * 60
                };
                var balance = await ActualizarBalanceAsync(usuarioId, -ware.Valor);
                autobump.TransaccionId = await RegistrarAutoBumpsAsync(usuarioId, balance.Balance, tier);
                _context.AutoBumps.Add(autobump);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<bool> CrearMensajeGlobalAsync(string usuarioId, string mensaje, int tier)
        {
            var ware = mensajeGlobalOpts.Value.FirstOrDefault(w => w.Id == ((int)tier));
            var mg = new MensajeGlobalModel
            {
                Id = hashService.Random(),
                UsuarioId = usuarioId,
                Mensaje = formateador.Parsear(mensaje),
                Tier = tier,
                Restante = ware.Duracion * 60
            };
            var balance = await ActualizarBalanceAsync(usuarioId, -ware.Valor);
            mg.TransaccionId = await RegistrarMensajeGlobalAsync(usuarioId, balance.Balance, tier);
            _context.MensajesGlobales.Add(mg);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> RegistrarAutoBumpsAsync(string usuarioId, float balance, int tier)
        {
            var ware = autoBumpOpts.Value.FirstOrDefault(w => w.Id == tier);
            var trac = new TransaccionModel
            {
                Id = hashService.Random(),
                OrigenCantidad = ware.Valor,
                OrigenUnidad = "RouzCoins",
                DestinoCantidad = ware.Duracion,
                DestinoUnidad = "minutos",
                Tipo = TipoTransaccion.AutoBump,
                UsuarioId = usuarioId,
                Balance = balance
            };

            _context.Transacciones.Add(trac);
            await _context.SaveChangesAsync();
            return trac.Id;
        }

        public async Task<string> RegistrarMensajeGlobalAsync(string usuarioId, float balance, int tier)
        {
            var ware = mensajeGlobalOpts.Value.FirstOrDefault(w => w.Id == tier);
            var trac = new TransaccionModel
            {
                Id = hashService.Random(),
                OrigenCantidad = ware.Valor,
                OrigenUnidad = "RouzCoins",
                DestinoCantidad = 1,
                DestinoUnidad = ware.Nombre,
                Tipo = TipoTransaccion.MensajeGlobal,
                UsuarioId = usuarioId,
                Balance = balance
            };

            _context.Transacciones.Add(trac);
            await _context.SaveChangesAsync();
            return trac.Id;
        }

        public async Task ActualizarPremiums()
        {
            var golds = (await userManager.GetUsersForClaimAsync(new Claim("Premium", "gold"))).Select(g => g.Id);
            var ahora = DateTimeOffset.Now;
            var balances = await _context.Balances.AsNoTracking().Where(b => golds.Contains(b.UsuarioId)).Where(b => b.Expiracion < ahora).Select(b => b.UsuarioId).ToListAsync();

            foreach (var id in balances)
            {
                var exito = false;
                var user = await userManager.FindByIdAsync(id);
                var result = await userManager.RemoveClaimAsync(user, new Claim("Premium", "gold"));
                exito = result.Succeeded;
                if (exito)
                    logger.LogInformation($"{user.UserName} ya no es premium");
            };
        }

        public async Task ActualizarWares(int interval)
        {
            var autoQuery = _context.AutoBumps.Where(a => a.Estado == EstadoWare.Normal).Where(a => a.Restante >= 0);
            var listaHilosAutobump = await autoQuery.Where(a => a.Restante % 300 == 0).Include(a => a.Hilo).Select(a => a.Hilo).ToListAsync();

            var ahora = DateTimeOffset.Now;
            foreach (var h in listaHilosAutobump)
            {
                h.Bump = ahora;
            }

            var listaAutoBumps = await autoQuery.ToListAsync();

            foreach (var a in listaAutoBumps)
            {
                a.Restante -= interval;
            }

            var listaMensajesGlobales = await _context.MensajesGlobales.Where(mg => mg.Estado == EstadoWare.Normal).Where(mg => mg.Restante >= 0).ToListAsync();

            foreach (var mg in listaMensajesGlobales)
            {
                mg.Restante -= interval;
            }

            await _context.SaveChangesAsync();
        }

        public bool CheckearCategoriaPremium(int id, bool esPremium)
        {
            var cate = categoriasOpts.Value.Premium().FirstOrDefault(c => c.Id == id);
            return CheckearCategoriaPremium(cate, esPremium);
        }
        public bool CheckearCategoriaPremium(string categoria, bool esPremium)
        {
            var cate = categoriasOpts.Value.Premium().FirstOrDefault(c => c.NombreCorto.ToLower() == categoria.ToLower());
            return CheckearCategoriaPremium(cate, esPremium);
        }
        public bool CheckearCategoriaPremium(Categoria cate, bool esPremium)
        {
            if (cate is null)
            {
                return true;
            }
            return esPremium;
        }

        public int[] CheckearListaCategoriasPremium(int[] categorias, bool esPremium)
        {
            if (!esPremium)
            {
                var categoriasPremium = categoriasOpts.Value.Premium().Ids().ToArray();
                categorias = categorias.Where(c1 => categoriasPremium.All(c2 => c1 != c2)).ToArray();
            }
            return categorias;
        }

        public async Task<bool> CheckearPremium(string id)
        {
            var user = await userManager.FindByIdAsync(id);
            if (user is null)
            {
                return false;
            }
            var userClaims = await userManager.GetClaimsAsync(user);
            return userClaims.Any(c => (c.Type == "Premium" && c.Value == "gold") ||
            (c.Type == "Role" && (c.Value == "mod" || c.Value == "admin" || c.Value == "dev" || c.Value == "director")));
        }

        public async Task<List<MensajeGlobalViewModel>> GetMensajesGlobalesActivosOrdenados()
        {
            var mgs = await _context.MensajesGlobales
                .AsNoTracking()
                .Where(mg => mg.Restante >= 0)
                .Where(mg => mg.Estado == EstadoWare.Normal)
                .OrderByDescending(mg => mg.Tier)
                .ThenBy(mg => mg.Creacion)
                .Select(mg => new MensajeGlobalViewModel(mg, mensajeGlobalOpts.Value)).ToListAsync();
            return mgs;
        }

        public async Task EliminarAutoBump(string id)
        {
            var ab = await _context.AutoBumps.FirstOrDefaultAsync(ab => ab.Id == id);
            ab.Estado = EstadoWare.Eliminado;
            var ware = autoBumpOpts.Value.FirstOrDefault(w => w.Id == 0);
            var balance = await ObtenerBalanceAsync(ab.UsuarioId);
            balance.Balance += ware.Valor;
            await _context.SaveChangesAsync();

            await RegistrarReembolsoAsync(ab.UsuarioId, balance.Balance, ware.Valor, "RouzCoins", 1, ware.Nombre);
        }

        public async Task EliminarMensajeGlobal(string id)
        {
            var mg = await _context.MensajesGlobales.FirstOrDefaultAsync(mg => mg.Id == id);
            mg.Estado = EstadoWare.Eliminado;
            var ware = mensajeGlobalOpts.Value.FirstOrDefault(w => w.Id == mg.Tier);
            var balance = await ObtenerBalanceAsync(mg.UsuarioId);
            balance.Balance += ware.Valor;
            await _context.SaveChangesAsync();

            await RegistrarReembolsoAsync(mg.UsuarioId, balance.Balance, ware.Valor, "RouzCoins", 1, ware.Nombre);
            await rchanHub.Clients.All.SendAsync("MensajeGlobalEliminados", id);
        }

        public async Task<string> RegistrarReembolsoAsync(string usuarioId, float balance, float origen, string origenUnidad, float destino, string destinoUnidad)
        {

            var reembolso = new TransaccionModel
            {
                Id = hashService.Random(),
                OrigenCantidad = origen,
                OrigenUnidad = origenUnidad,
                DestinoCantidad = destino,
                DestinoUnidad = destinoUnidad,
                Tipo = TipoTransaccion.Reembolso,
                UsuarioId = usuarioId,
                Balance = balance
            };

            _context.Transacciones.Add(reembolso);
            await _context.SaveChangesAsync();
            return reembolso.Id;
        }

        public async Task LimpiarMensajesGlobalesViejos()
        {
            var mgs = await _context.MensajesGlobales.Where(mg => mg.Restante < 0 || mg.Estado == EstadoWare.Eliminado).ToListAsync();
            _context.RemoveRange(mgs);
            await _context.SaveChangesAsync();
        }

        public async Task<ComprobanteModel> GuardarComprobante(IFormFile archivo)
        {
            using var archivoStream = archivo.OpenReadStream();
            string type = archivo.ContentType;
            string fmt = type.Split("/")[1];

            var comprobante = new ComprobanteModel
            {
                Id = hashService.Random(),
                Format = fmt
            };
            comprobante.Path = $"{CarpetaDeComprobantes}/{comprobante.Id}.{fmt}";

            using var imagen = await Image.LoadAsync(archivoStream);
            await imagen.SaveAsync(comprobante.Path);
            await archivoStream.DisposeAsync();
            return comprobante;
        }

        public async Task<bool> EliminarComprobante(ComprobanteModel comprobante)
        {
            var intentos = 25;
            while (intentos > 0)
            {
                try
                {
                    File.Delete(comprobante.Path);
                    return true;
                }
                catch (Exception e)
                {
                    logger.LogError(e.ToString());
                    intentos--;
                    await Task.Delay(100);
                }
            }
            return false;
        }


    }
}
