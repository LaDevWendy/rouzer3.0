using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class MensajeGlobalViewModel
    {
        public string Id { get; set; }
        public string Mensaje { get; set; }
        public string Color { get; set; }
        public float Completado { get; set; }


        public MensajeGlobalViewModel(MensajeGlobalModel mensajeGlobalModel, List<MensajeGlobal> mensajesGlobalesOpts)
        {
            var mgOpt = mensajesGlobalesOpts.FirstOrDefault(w => w.Id == mensajeGlobalModel.Tier);
            this.Id = mensajeGlobalModel.Id;
            this.Mensaje = mensajeGlobalModel.Mensaje;
            this.Completado = 100f - 10f * (float)mensajeGlobalModel.Restante / (mgOpt.Duracion * 6f);
            this.Color = mgOpt.Color;
        }
    }
}
