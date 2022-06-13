using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class MensajeGlobalModel : WareModel
    {
        [Required]
        public Tiers Tier { get; set; }
        public string Mensaje { get; set; }
    }

    public enum Tiers
    {
        Hierro,
        Bronce,
        Plata,
        Oro,
        Platino,
        Diamante
    }
}
