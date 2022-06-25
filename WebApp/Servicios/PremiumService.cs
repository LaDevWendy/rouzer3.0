using Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Modelos;
using System;
using System.Collections.Generic;
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
        private readonly IOptionsSnapshot<List<Ware>> wareOpts;
        private readonly ILogger<PremiumService> logger;
        private readonly FormateadorService formateador;
        private readonly IHubContext<RChanHub> rchanHub;
        public PremiumService(RChanContext context,
            HashService hashService,
            UserManager<UsuarioModel> userManager,
            IOptionsSnapshot<List<Categoria>> categoriasOpts,
            IOptionsSnapshot<List<Ware>> wareOpts,
            ILogger<PremiumService> logger,
            FormateadorService formateador,
            IHubContext<RChanHub> rchanHub) : base(context, hashService)
        {
            this.categoriasOpts = categoriasOpts;
            this.userManager = userManager;
            this.logger = logger;
            this.wareOpts = wareOpts;
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
            var accionCP = new AccionCodigoPremiumModel();
            accionCP.Id = hashService.Random();
            accionCP.UsuarioId = userId;
            accionCP.CodigoPremiumId = cpId;
            accionCP.Tipo = tipo;
            _context.AccionesCodigosPremium.Add(accionCP);
            await _context.SaveChangesAsync();
        }

        public async Task RegistrarActivacionAsync(string userId, float cantidad)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == userId);
            var regalo = new TransaccionModel();
            regalo.Id = hashService.Random();
            regalo.OrigenCantidad = 1f;
            regalo.OrigenUnidad = "Código Premium";
            regalo.DestinoCantidad = cantidad;
            regalo.DestinoUnidad = "Días Premium";
            regalo.Tipo = TipoTransaccion.Compra;
            regalo.Usuario = usuario;
            regalo.Balance = -1;
            _context.Transacciones.Add(regalo);
            await _context.SaveChangesAsync();
        }

        public async Task RegistrarAgregarRouzCoinsAsync(string userId, float cantidad, float balance)
        {
            var regalo = new TransaccionModel();
            regalo.Id = hashService.Random();
            regalo.OrigenCantidad = 1f;
            regalo.OrigenUnidad = "Código Premium";
            regalo.DestinoCantidad = cantidad;
            regalo.DestinoUnidad = "RouzCoins";
            regalo.Tipo = TipoTransaccion.Compra;
            regalo.UsuarioId = userId;
            regalo.Balance = balance;
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
        public async Task<bool> CrearAutoBumpsAsync(string usuarioId, string hiloId)
        {
            if (await CheckearAutobumpsHilo(hiloId))
            {
                var ware = wareOpts.Value.FirstOrDefault(w => w.Id == 0);
                var autobump = new AutoBumpModel();
                autobump.Id = hashService.Random();
                autobump.UsuarioId = usuarioId;
                autobump.HiloId = hiloId;
                autobump.Restante = ware.Duracion * 60;
                var balance = await ActualizarBalanceAsync(usuarioId, -ware.Valor);
                autobump.TransaccionId = await RegistrarAutoBumpsAsync(usuarioId, balance.Balance);
                _context.AutoBumps.Add(autobump);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<bool> CrearMensajeGlobalAsync(string usuarioId, string mensaje, int tier)
        {
            var ware = wareOpts.Value.FirstOrDefault(w => w.Id == tier);
            var mg = new MensajeGlobalModel();
            mg.Id = hashService.Random();
            mg.UsuarioId = usuarioId;
            mg.Mensaje = formateador.Parsear(mensaje);
            mg.Tier = (Tiers)(tier - 1);
            mg.Restante = ware.Duracion * 60;
            var balance = await ActualizarBalanceAsync(usuarioId, -ware.Valor);
            mg.TransaccionId = await RegistrarMensajeGlobalAsync(usuarioId, balance.Balance, (Tiers)(tier - 1));
            _context.MensajesGlobales.Add(mg);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> RegistrarAutoBumpsAsync(string usuarioId, float balance)
        {
            var ware = wareOpts.Value.FirstOrDefault(w => w.Id == 0);
            var autobump = new TransaccionModel
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

            _context.Transacciones.Add(autobump);
            await _context.SaveChangesAsync();
            return autobump.Id;
        }

        public async Task<string> RegistrarMensajeGlobalAsync(string usuarioId, float balance, Tiers tier)
        {
            var ware = wareOpts.Value.FirstOrDefault(w => w.Id == ((int)tier + 1));
            var autobump = new TransaccionModel
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

            _context.Transacciones.Add(autobump);
            await _context.SaveChangesAsync();
            return autobump.Id;
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
            var autoQuery = _context.AutoBumps.Where(a => a.Restante >= 0);
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

            var listaMensajesGlobales = await _context.MensajesGlobales.Where(mg => mg.Estado == EstadoMensajeGlobal.Normal).Where(mg => mg.Restante >= 0).ToListAsync();

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
                .Where(mg => mg.Estado == EstadoMensajeGlobal.Normal)
                .OrderByDescending(mg => mg.Tier)
                .ThenBy(mg => mg.Creacion)
                .Select(mg => new MensajeGlobalViewModel(mg, wareOpts.Value)).ToListAsync();
            return mgs;
        }

        public async Task EliminarMensajeGlobal(string id)
        {
            var mg = await _context.MensajesGlobales.FirstOrDefaultAsync(mg => mg.Id == id);
            mg.Estado = EstadoMensajeGlobal.Eliminado;
            var ware = wareOpts.Value.FirstOrDefault(w => w.Id == ((int)mg.Tier + 1));
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
            var mgs = await _context.MensajesGlobales.Where(mg => mg.Restante < 0 || mg.Estado == EstadoMensajeGlobal.Eliminado).ToListAsync();
            _context.RemoveRange(mgs);
            await _context.SaveChangesAsync();
        }

    }
}
