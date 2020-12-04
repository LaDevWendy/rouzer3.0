using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class Encuesta
    {
        public IList<OpcionEncuesta>  Opciones { get; set; } = new List<OpcionEncuesta>();
        public List<string> Ips { get; set; } = new List<string>();
        public List<string> Ids { get; set; } = new List<string>();
    }

    public class OpcionEncuesta
    {
        public string Nombre { get; set; } = "";
        public int Votos { get; set; }
    }
}
