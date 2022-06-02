using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class CrearViewModel
    {
        public string Contenido { get; set; } = "";
        public IFormFile Archivo { get; set; }
        public IFormFile Audio { get; set; }
        public string Link { get; set; }
        public bool MostrarRango { get; set; } = false;
        public bool MostrarRangoAdmin { get; set; } = false;
        public bool MostrarRangoDev { get; set; } = false;
        public bool MostrarNombre { get; set; } = false;
        public string FingerPrint { get; set; }
        public string Captcha { get; set; }
        public bool Spoiler { get; set; }
    }
}
