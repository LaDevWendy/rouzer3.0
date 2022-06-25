using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class CodigoPremiumModel : BaseModel
    {
        public DateTimeOffset Expiracion { get; set; }
        public TipoCP Tipo { get; set; }
        public float Cantidad { get; set; }
        public int Usos { get; set; }
    }

    public enum TipoCP
    {
        ActivacionPremium,
        RouzCoins
    }
}

