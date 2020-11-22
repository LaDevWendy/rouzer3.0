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
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;

namespace Servicios
{
    public interface IComentarioService
    {
        Task Guardar(ComentarioModel comentario, bool bumpearHilo = true);
        Task<List<ComentarioViewModel>> DeHilo(string hiloId, string creadorId);
    }

    public class ComentarioService : ContextService, IComentarioService
    {
        private readonly FormateadorService formateador;

        public ComentarioService(RChanContext context,       
            FormateadorService formateador,              
            HashService hashService)
            : base(context, hashService)
        {
            this.formateador = formateador;
        }

        public async Task<List<ComentarioViewModel>> DeHilo(string hiloId, string creadorId)
        {
            return await _context.Comentarios
                .Where(c => c.HiloId == hiloId)
                .Where(c => c.Estado == ComentarioEstado.Normal)
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
            comentario.Contenido = formateador.Parsear(comentario.Contenido);
            comentario.Id = hashService.Random(8).ToUpper();
            _context.Comentarios.Add(comentario);
            await _context.SaveChangesAsync();
            
            if(!comentario.Contenido.Contains("gt;hide")) 
            {
                await db.Query("Hilos")
                    .Where("Id", comentario.HiloId)
                    .UpdateAsync(new { Bump = DateTimeOffset.Now});
            }
        }
    }
}
