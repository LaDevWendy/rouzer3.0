using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class DonacionModel : BaseModel
    {
        public string HiloId { get; set; }
        public HiloModel Hilo { get; set; }
        public float Cantidad { get; set; }
    }
}
