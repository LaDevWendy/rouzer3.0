using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class ApelacionModel : BaseModel
    {
        [Required]
        public string BanId { get; set; }
        public BaneoModel Ban { get; set; }
        [Required]
        public ApelacionEstado Estado { get; set; } = ApelacionEstado.Pendiente;
        public string Descripcion { get; set; } = "";
        [Required]
        public string UsuarioId { get; set; }
        public UsuarioModel Usuario { get; set; }

    }
    public enum ApelacionEstado
    {
        Pendiente,
        Aceptada,
        Rechazada,
    }
}
