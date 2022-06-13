using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class AutoBumpModel : WareModel
    {
        [Required]
        public string HiloId { get; set; }
        public HiloModel Hilo { get; set; }
    }
}
