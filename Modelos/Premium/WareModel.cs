using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class WareModel : BaseModel
    {
        [Required]
        public string UsuarioId { get; set; }
        public UsuarioModel Usuario { get; set; }
        [Required]
        public string TransaccionId { get; set; }
        public TransaccionModel Transaccion { get; set; }
        public int Restante { get; set; }
        public EstadoWare Estado { get; set; } = EstadoWare.Normal;
    }

    public enum EstadoWare
    {
        Normal,
        Eliminado
    }
}
