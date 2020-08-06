using System;

namespace Modelos
{
    public class HiloModel : CreacionUsuario
    {
        public string Titulo { get; set; }
        public string Contenido { get; set; }
        public int CategoriaId { get; set; }
        public DateTimeOffset Bump { get; set; }
    }
}
