using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore;
using Microsoft.Extensions.Logging;
using Servicios;
using System.Collections.Generic;
using Modelos;
using System.Threading.Tasks;
using Data;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;



namespace WebApp.Controllers
{
    [Authorize]
    public class NotificacionController : Controller
    {
        private readonly RChanContext _context;
        public NotificacionController(
            RChanContext _context
        )
        {
            this._context = _context;
        }

        [HttpGet("Notificacion/{id}")]
        public async Task<IActionResult> Index(string id)
        {
            var noti = await _context.Notificaciones.AsNoTracking().FirstOrDefaultAsync(n => n.Id == id);
            if(noti is null) Redirect("/");

            var query =  _context.Notificaciones.AsQueryable();
                if(noti.Tipo == NotificacionType.Comentario)
                {
                    query = query.Where(n => n.UsuarioId == User.GetId() && n.Tipo == noti.Tipo 
                    && noti.HiloId == n.HiloId);
                }
                else 
                {
                    query = query.Where(n => n.UsuarioId == User.GetId() && n.Tipo == noti.Tipo 
                    && noti.HiloId == n.HiloId &&  n.ComentarioId == noti.ComentarioId);
                }
                
            var notisABorrar = await query.Select(n => new NotificacionModel{Id = n.Id})
                .ToListAsync();

            _context.Notificaciones.RemoveRange(notisABorrar);
            await _context.SaveChangesAsync();

            return Redirect($"/Hilo/{noti.HiloId}");
        }

        public async Task<IActionResult> Limpiar()
        {
            var notisABorrar = await _context.Notificaciones
                .Where(n => n.UsuarioId == User.GetId())
                 .Select(n => new NotificacionModel {Id = n.Id})
                .ToListAsync();

            _context.RemoveRange(notisABorrar);
            await _context.SaveChangesAsync();

            return Redirect("/");
        }
    }
}