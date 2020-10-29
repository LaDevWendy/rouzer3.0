using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace Modelos

{
    public class UsuarioModel : IdentityUser
    {
        [ForeignKey("UsuarioId")]
        public ICollection<NotificacionModel> Notificaciones { get; set; }
    }
}
