using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class MensajeGlobalModel : WareModel
    {
        [Required]
        public int Tier { get; set; }
        public string Mensaje { get; set; }

    }


}
