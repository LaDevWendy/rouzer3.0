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
        private readonly HtmlEncoder htmlEncoder;

        public ComentarioService(RChanContext context,                     
            HtmlEncoder htmlEncoder,
            HashService hashService)
            : base(context, hashService)
        {
            this.htmlEncoder = htmlEncoder;
        }

        public async Task<List<ComentarioViewModel>> DeHilo(string hiloId, string creadorId)
        {
            return await _context.Comentarios
                .Where(c => c.HiloId == hiloId)
                .Where(c => c.Estado != ComentarioEstado.Eliminado)
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
            comentario.Contenido = Parsear(comentario.Contenido);
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

        private string Parsear(string contenido) {
            var tags = new List<string>();
            return string.Join("\n", contenido.Split("\n").Select(t => {
                t = htmlEncoder.Encode(t);
                var esLink = false;
                //Links
                t = Regex.Replace(t, @"&gt;(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)", m => {
                    var link = m.Value.Replace("&gt;", "");
                    esLink = true;
                    return $@"<a href=""{link}"" target=""_blank"">&gt{link}</a>";
                });
                if(esLink) return t;
                //Respuestas
                t =  Regex.Replace(t, @"&gt;&gt;([A-Z0-9]{8})", m => {
                    if(tags.Contains(m.Value)) return "";
                    tags.Add(m.Value);
                    var id = m.Groups[1].Value;
                    return $"<a href=\"#{id}\" class=\"restag\" r-id=\" {id}\">&gt;&gt;{id}</a>";
                });

                //Texto verde
                t = Regex.Replace(t.Replace("&#xA;", "\n"),@"&gt;(?!https?).+(?:$|\n)", m => {
                    if(m.Value.Contains("&gt;&gt;") || m.Value.Contains("href")) return m.Value;
                    var text = m.Value.Replace("&gt;", "");
                    return $@"<span class=""verde"">&gt;{text}</span>";
                });
                return t;
            }));
        }
    }
}
