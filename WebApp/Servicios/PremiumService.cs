using Data;
using Microsoft.EntityFrameworkCore;
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
        private readonly IOptionsSnapshot<List<Categoria>> categoriasOpts;
        public PremiumService(RChanContext context, HashService hashService, IOptionsSnapshot<List<Categoria>> categoriasOpts) : base(context, hashService)
        {
            this.categoriasOpts = categoriasOpts;
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

        public async Task RegistrarRegaloAsync(string id, float cantidad, float balance)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
            var regalo = new TransaccionModel();
            regalo.Id = hashService.Random();
            regalo.OrigenCantidad = 1f;
            regalo.OrigenUnidad = "Regalo";
            regalo.DestinoCantidad = cantidad;
            regalo.DestinoUnidad = "RouzCoins";
            regalo.Tipo = TipoTransaccion.Compra;
            regalo.Usuario = usuario;
            regalo.Balance = balance;
            _context.Transacciones.Add(regalo);
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

    }
}
