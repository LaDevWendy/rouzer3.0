using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class MensajeGlobalModel : WareModel
    {
        [Required]
        public Tiers Tier { get; set; }
        public string Mensaje { get; set; }
        public EstadoMensajeGlobal Estado { get; set; } = EstadoMensajeGlobal.Normal;
    }

    public enum Tiers
    {
        Rojo,
        Naranja,
        Amarillo,
        Verde,
        Azul,
        Blanco
    }

    public enum EstadoMensajeGlobal
    {
        Normal,
        Eliminado
    }
}
