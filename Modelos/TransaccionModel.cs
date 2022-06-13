using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class TransaccionModel : BaseModel
    {
        [Required]
        public string UsuarioId { get; set; }
        public UsuarioModel Usuario { get; set; }
        public TipoTransaccion Tipo { get; set; }
        public string WareId { get; set; }
        public float OrigenCantidad { get; set; }
        public float DestinoCantidad { get; set; }
        public string OrigenUnidad { get; set; }
        public string DestinoUnidad { get; set; }
        public float Balance { get; set; }
    }

    public enum TipoTransaccion
    {
        Compra,
        Reembolso,
        MensajeGlobal,
        AutoBump
    }

}
