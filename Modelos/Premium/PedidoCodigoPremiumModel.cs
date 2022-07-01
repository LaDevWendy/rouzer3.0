using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class PedidoCodigoPremiumModel : BaseModel
    {
        public string UsuarioId { get; set; }
        public UsuarioModel Usuario { get; set; }
        public TipoCP Tipo { get; set; }
        public int Paquete { get; set; }
        public int Metodo { get; set; }
        public PedidoEstado Estado { get; set; } = PedidoEstado.Pendiente;
        public string CodigoMembreciaId { get; set; }
        public string CodigoPaqueteId { get; set; }
        public CodigoPremiumModel CodigoMembrecia { get; set; }
        public CodigoPremiumModel CodigoPaquete { get; set; }
        public string ComprobanteId { get; set; }
        public ComprobanteModel Comprobante { get; set; }
    }

    public enum PedidoEstado
    {
        Pendiente,
        RechazadoPorUsuario,
        Rechazado,
        Aceptado
    }

}
