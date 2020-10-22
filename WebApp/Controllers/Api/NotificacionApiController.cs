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
    [ApiController, Route("api/Notificacion/{action}/")]

    [Authorize]
    public class NotificacionApiController : Controller
    {
        private readonly RChanContext _context;
        public NotificacionApiController(
            RChanContext _context
        )
        {
            this._context = _context;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse>> Limpiar()
        {
            var notisABorrar = await _context.Notificaciones
                .Where(n => n.UsuarioId == User.GetId())
                 .Select(n => new NotificacionModel {Id = n.Id})
                .ToListAsync();

            _context.RemoveRange(notisABorrar);
            await _context.SaveChangesAsync();

            return new ApiResponse("Notificaciones limpiadas");
        }
    }
}