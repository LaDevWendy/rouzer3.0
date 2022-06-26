using System.Collections.Generic;
using System.Linq;

namespace Modelos
{
    public class Ware
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public float Valor { get; set; }
        public int Duracion { get; set; }
    }

    public class AutoBump : Ware
    {

    }

    public class MensajeGlobal : Ware
    {
        public string Color { get; set; }
    }

}
