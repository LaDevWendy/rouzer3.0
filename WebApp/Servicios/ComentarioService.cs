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
using Microsoft.AspNetCore.SignalR;
using WebApp;

namespace Servicios
{
    public interface IComentarioService
    {
        Task Guardar(ComentarioModel comentario, bool bumpearHilo = true);
        Task<List<ComentarioViewModel>> DeHilo(string hiloId, string creadorId);
        Task Eliminar(params string[] ids);
    }

    public class ComentarioService : ContextService, IComentarioService
    {
        private readonly FormateadorService formateador;
        private readonly IHubContext<RChanHub> rchanHub;

        public ComentarioService(RChanContext context,       
            FormateadorService formateador,              
            IHubContext<RChanHub> rchanHub,
            HashService hashService)
            : base(context, hashService)
        {
            this.rchanHub = rchanHub;
            this.formateador = formateador;
        }

        public async Task<List<ComentarioViewModel>> DeHilo(string hiloId, string creadorId)
        {
            return await _context.Comentarios
                .Where(c => c.HiloId == hiloId)
                .Where(c => c.Estado == ComentarioEstado.Normal)
                .OrderByDescending(c => c.Creacion)
                .Include(c => c.Media)
                .Select(c => new ComentarioViewModel(c))
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

        public async Task Eliminar(params string[] ids)
        {
            var comentarios = await _context.Comentarios
                .Where(c => ids.Contains(c.Id))
                .Where(c => c.Estado != ComentarioEstado.Eliminado)
                .ToListAsync();

            comentarios.ForEach(c => c.Estado = ComentarioEstado.Eliminado);

            var denuncias = await _context.Denuncias
                .Where(d => ids.Contains(d.ComentarioId))
                .ToListAsync();
            denuncias.ForEach(d => d.Estado = EstadoDenuncia.Aceptada);            
            
            await rchanHub.Clients.All.SendAsync("ComentariosEliminados", ids);

            int eliminados = await _context.SaveChangesAsync();
        }
    }

}
