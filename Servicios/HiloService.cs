using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Modelos;
using Data;
using SqlKata.Execution;
using SqlKata.Compilers;
using System.Linq;
using Dapper;

namespace Servicios
{
    public interface IHiloService
    {
        Task<List<HiloViewModel>> GetHilosOrdenadosPorBump();
        Task<List<HiloViewModel>> GetHilosOrdenadosPorBump(GetHilosOptions opciones);
        Task<string> GuardarHilo(HiloModel Hilo);
        Task ActualizarHilo(HiloModel Hilo);
        Task<HiloViewModel> GetHilo(string id, bool mostrarOcultos);
        Task<HiloFullViewModel> GetHiloFull(string id, string userId = null, bool mostrarOcultos = false);
        IQueryable<HiloModel> OrdenadosPorBump();
    }

    public class HiloService : ContextService, IHiloService
    {
        private readonly IComentarioService comentarioService;

        public HiloService(RChanContext context,
            HashService hashService,
            IComentarioService comentarioService)
        : base(context, hashService)
        {
            this.comentarioService = comentarioService;
        }

        public async Task ActualizarHilo(HiloModel Hilo)
        {
            _context.Hilos.Update(Hilo);
            await _context.SaveChangesAsync();
        }

        public async Task<HiloViewModel> GetHilo(string id, bool mostrarOcultos = false)
        {
            var hilo = await _context.Hilos
                .FirstOrDefaultAsync(h =>
                h.Id == id &&
                (h.Estado ==  HiloEstado.Normal || mostrarOcultos));

            if (hilo is null) return null;
            return new HiloViewModel(hilo);

        }
        public async Task<HiloFullViewModel> GetHiloFull(string id, string userId = null, bool mostrarOcultos = false)
        {
            var hiloFullView = new HiloFullViewModel();

            var hilo = await _context.Hilos
                .Include(h => h.Media)
                .FirstOrDefaultAsync(h =>
                h.Id == id &&
                (h.Estado == HiloEstado.Normal || mostrarOcultos));

            if (hilo is null) return null;

            hiloFullView.Hilo = new HiloViewModel(hilo);

            hiloFullView.Comentarios = await comentarioService.DeHilo(id, hilo.UsuarioId);

             if (!string.IsNullOrEmpty(userId))
             {
                 hiloFullView.Acciones = await _context.HiloAcciones
                    .FirstOrDefaultAsync(a => a.UsuarioId == userId && a.HiloId == id);
             }
             
             hiloFullView.Acciones ??= new HiloAccionModel();

            return hiloFullView;

        }

        public Task<List<HiloViewModel>> GetHilosOrdenadosPorBump()
        {
            return GetHilosOrdenadosPorBump(new GetHilosOptions());
        }

        public async Task<List<HiloViewModel>> GetHilosOrdenadosPorBump(GetHilosOptions opciones)
        {
            // Mejorar esto
            var hilos =  await _context.Hilos
                .Where(h => opciones.CategoriasId.Contains(h.CategoriaId) && 
                !_context.HiloAcciones.Any(a => a.HiloId ==  h.Id && a.UsuarioId == opciones.UserId && a.Hideado)
                && !_context.Stickies.Any( s => s.HiloId == h.Id))
                .Where(h => h.Estado != HiloEstado.Eliminado || opciones.MostrarBorrados)
                .OrderByDescending(h => h.Bump)
                .Take(opciones.Cantidad)
                .AViewModel(_context).ToListAsync();
            
            if(!opciones.IncluirStickies) return hilos;

            var hilosStickies = await  _context.Stickies
                .Where(s => s.Global)
                .Select(s => _context.Hilos.FirstOrDefault(h => h.Id == s.HiloId))
                .AViewModel(_context).ToListAsync();
            
            var stickies = await _context.Stickies.ToListAsync();
            
            hilosStickies.ForEach(h => h.Sticky = stickies.First(s => s.HiloId == h.Id).Importancia);

            return  hilosStickies.OrderByDescending(h => h.Sticky).Concat(hilos).ToList();
        }

        // public async Task<List<HiloViewModel>> GetHilosRecientes(GetHilosOptions opciones)
        // {
        // }

        public async Task<string> GuardarHilo(HiloModel hilo)
        {
            hilo.Id = hashService.Random();
            _context.Hilos.Add(hilo);
            await _context.SaveChangesAsync();
            return hilo.Id;
        }

        public IQueryable<HiloModel> OrdenadosPorBump() {
            return _context.Hilos
                .Include(h => h.Media)
                .OrderByDescending(h => h.Bump);
        }
    }

    public class GetHilosOptions
    {
        public int Cantidad { get; set; } = 32;
        public int[] CategoriasId { get; set; } = new int[]{};
        public int[] IdsExcluidas { get; set; } = new int[0];
        public bool IncluirStickies { get; set; } = false;
        public string UserId { get; set; }
        public bool MostrarBorrados { get; set; } = false;
    }

     public static class HiloExtensions
    {
        public static IQueryable<HiloViewModel> AViewModel(this IQueryable<HiloModel> hilos, RChanContext context) {
            return hilos.Select(h => new HiloViewModel {
                    Bump = h.Bump,
                    CategoriaId = h.CategoriaId,
                    Contenido = h.Contenido,
                    Creacion = h.Creacion,
                    Media = h.Media,
                    Id = h.Id,
                    Titulo = h.Titulo,
                    CantidadComentarios = context.Comentarios.Where(c => c.HiloId == h.Id).Count()
                });
        }
        public static IQueryable<HiloViewModelMod> AViewModelMod(this IQueryable<HiloModel> hilos, RChanContext context) {
            return hilos.Select(h => new HiloViewModelMod {
                    Bump = h.Bump,
                    CategoriaId = h.CategoriaId,
                    Contenido = h.Contenido,
                    Creacion = h.Creacion,
                    Media = h.Media,
                    Id = h.Id,
                    Titulo = h.Titulo,
                    CantidadComentarios = context.Comentarios.Where(c => c.HiloId == h.Id).Count(),
                    UsuarioId = h.UsuarioId,
                });
        }

        public static IOrderedQueryable<HiloModel> OrdenadosPorBump(this IQueryable<HiloModel> hilos) {
            return hilos.OrderByDescending(h => h.Bump);
        }

        public static IQueryable<HiloModel> FiltrarNoActivos(this IQueryable<HiloModel> hilos) {
            return hilos.Where(h => h.Estado == HiloEstado.Normal);
        }

        public static IQueryable<HiloModel> FiltrarPorCategoria(this IQueryable<HiloModel> hilos, int[] categorias) {
            return hilos.Where(h => categorias.Contains(h.CategoriaId));
        }

        public static IQueryable<HiloModel> FiltrarOcultosDeUsuario(this IQueryable<HiloModel> hilos, string usuarioId, RChanContext context) {
            return hilos.Where( h => !context.HiloAcciones.Any(a => a.HiloId ==  h.Id && a.UsuarioId == usuarioId && a.Hideado));
        }
        public static IQueryable<T> DeUsuario<T>(this IQueryable<T> creaciones, string usuarioId) where T : CreacionUsuario{
            return creaciones.Where( h => h.UsuarioId == usuarioId);
        }
        public static IQueryable<T> Recientes<T> (this IQueryable<T> elemento) where T : BaseModel
        { 
            return elemento.OrderByDescending( h => h.Creacion);
        }

    }
}
