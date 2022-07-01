using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class Paquete
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public int Cantidad { get; set; }
        public string Valor { get; set; }
    }

    public class Membrecia : Paquete
    {

    }

    public class RouzCoin : Paquete
    {

    }

    public class MetodoDePago : Paquete
    {

    }
}
