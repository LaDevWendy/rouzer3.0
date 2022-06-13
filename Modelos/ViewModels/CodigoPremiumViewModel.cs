using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class CodigoPremiumViewModel
    {
        [Required(ErrorMessage = "Tienes que especificar una fecha de expiracion")]
        public DateTimeOffset Expiracion { get; set; }
        [Required(ErrorMessage = "Tienes que especificar un tipo de cp"), EnumDataType(typeof(TipoCP), ErrorMessage = "Ese tipo no existe")]
        public TipoCP Tipo { get; set; }
        [Required(ErrorMessage = "Tienes que especificar una cantidad"), Range(1, float.MaxValue, ErrorMessage = "Solo valores positivos")]
        public float Cantidad { get; set; }
        [Required(ErrorMessage = "Tienes que especificar un número de usos"), Range(1, int.MaxValue, ErrorMessage = "Solo valores positivos")]
        public int Usos { get; set; }
    }
}
