using System;
using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class ComentarioModel : CreacionUsuario
    {
        [Required]
        public string HiloId { get; set; }
        public string Contenido { get; set; }

        public HiloModel Hilo { get; set; }
        public UsuarioModel Usuario { get; set; }
    }
}
