using System;
using System.ComponentModel.DataAnnotations;
using System.Net;

namespace Modelos
{
    public class CreacionUsuario : BaseModel
    {
        [Required]
        public string UsuarioId { get; set; }
        public MediaModel Media { get; set; }
        public string MediaId { get; set; }
        public CreacionEstado Estado { get; set; } = CreacionEstado.Normal;
        public IPAddress Ip { get; set; }
    }

    public enum CreacionEstado
    {
        Sticky,
        Normal,
        Archivado,
        Oculto,
        ParaBorrar,
    }
}
