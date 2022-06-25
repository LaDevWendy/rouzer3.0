using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class AutoBumpModel : WareModel
    {
        public string HiloId { get; set; }
        public HiloModel Hilo { get; set; }
    }
}
