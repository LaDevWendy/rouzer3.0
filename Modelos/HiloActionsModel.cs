using System;

namespace Modelos
{
    public class HiloAccionModel : BaseModel
    {
        public string UsuarioId { get; set; }
        public string HiloId { get; set; }
        public bool Seguido { get; set; }
        public bool Favorito { get; set; }
        public bool Hideado { get; set; }
    }
}
