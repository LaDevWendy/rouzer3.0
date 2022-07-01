using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class AccionCodigoPremiumModel : BaseModel
    {
        [Required]
        public string UsuarioId { get; set; }
        public UsuarioModel Usuario { get; set; }
        [Required]
        public string CodigoPremiumId { get; set; }
        public CodigoPremiumModel CodigoPremium { get; set; }
        [Required]
        public TipoAccionCP Tipo { get; set; }
    }
    public enum TipoAccionCP
    {
        Creacion,
        Uso
    }
}
