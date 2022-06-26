using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class PedidoCodigoPremiumViewModel
    {
        [Required(ErrorMessage = "Tienes que especificar un tipo de cp"), EnumDataType(typeof(TipoCP), ErrorMessage = "Ese tipo no existe")]
        public TipoCP Tipo { get; set; }
        public int Paquete { get; set; }
        public int Metodo { get; set; }
        public IFormFile Archivo { get; set; }
    }

}
