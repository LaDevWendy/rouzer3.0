using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Modelos
{
    public class ComentarioModel : CreacionUsuario
    {
        [Required]
        public string HiloId { get; set; }
        public string Contenido { get; set; }
        public ComentarioEstado Estado { get; set; } = ComentarioEstado.Normal;

        public HiloModel Hilo { get; set; }
        public UsuarioModel Usuario { get; set; }
        public bool Sticky { get; set; } = false;
        public bool Ignorado { get; set; } = false;
    }
    public enum ComentarioEstado
    {
        Normal,
        Eliminado,
    }
}
