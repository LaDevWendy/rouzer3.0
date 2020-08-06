using System.Collections.Generic;
using Modelos;

namespace Modelos
{
    public class HiloFullViewModel
    {
        public HiloViewModel Hilo { get; set; }
        public List<ComentarioViewModel> Comentarios { get; set; }
        public HiloAccionModel Acciones { get; set; }
    }
}