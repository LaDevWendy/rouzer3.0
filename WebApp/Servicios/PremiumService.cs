using Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Modelos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Servicios
{
    public class PremiumService : ContextService
    {
        private readonly UserManager<UsuarioModel> userManager;
        private readonly IOptionsSnapshot<List<Categoria>> categoriasOpts;
        private readonly IOptionsSnapshot<List<Ware>> wareOpts;
        private readonly ILogger<PremiumService> logger;
        public PremiumService(RChanContext context, HashService hashService, UserManager<UsuarioModel> userManager, IOptionsSnapshot<List<Categoria>> categoriasOpts, IOptionsSnapshot<List<Ware>> wareOpts, ILogger<PremiumService> logger) : base(context, hashService)
        {
            this.categoriasOpts = categoriasOpts;
            this.userManager = userManager;
            this.logger = logger;
            this.wareOpts = wareOpts;
        }
        public async Task<BalanceModel> ObtenerBalanceAsync(string id)
        {
            var balance = await _context.Balances.FirstOrDefaultAsync(b => b.UsuarioId == id);
            if (balance is null)
            {
                balance = new BalanceModel();
                balance.Id = id;
                balance.Usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
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
            regalo.Balance = 0;
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
                return false;
            }
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

        public async Task ActualizarPremiums()
        {
            var golds = (await userManager.GetUsersForClaimAsync(new Claim("Premium", "gold"))).Select(g => g.Id);
            var ahora = DateTime.Now;
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

    }
}
