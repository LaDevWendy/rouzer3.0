using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Data;
using Modelos;
using SqlKata.Execution;
using SqlKata.Compilers;
using SqlKata;
using Dapper;

namespace Servicios
{
    public interface IComentarioService
    {
        Task Guardar(ComentarioModel comentario, bool bumpearHilo = true);
        Task<List<ComentarioViewModel>> DeHilo(string hiloId, string creadorId);
    }

    public class ComentarioService : ContextService, IComentarioService
    {
        public ComentarioService(RChanContext context, HashService hashService) : base(context, hashService)
        {
        }

        public async Task<List<ComentarioViewModel>> DeHilo(string hiloId, string creadorId)
        {
            return await _context.Comentarios
                .Where(c => c.HiloId == hiloId)
                .OrderByDescending(c => c.Creacion)
                .Include(c => c.Media)
                .Select(c => new ComentarioViewModel {
                    Contenido = c.Contenido,
                    Id = c.Id,
                    Creacion = c.Creacion,
                    EsOp = c.UsuarioId == creadorId,
                    Media = c.Media
                })
                .ToListAsync();
        }

        public async Task Guardar(ComentarioModel comentario, bool bumpearHilo = true)
        {
            comentario.Id = hashService.Random(8).ToUpper();
            _context.Comentarios.Add(comentario);
            await _context.SaveChangesAsync();
            
            await db.Query("Hilos")
                .Where("Id", comentario.HiloId)
                .UpdateAsync(new { Bump = DateTimeOffset.Now});
        }
    }
}
