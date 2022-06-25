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


        public MensajeGlobalViewModel(MensajeGlobalModel mensajeGlobalModel, List<Ware> wares)
        {
            this.Id = mensajeGlobalModel.Id;
            this.Mensaje = mensajeGlobalModel.Mensaje;
            this.Completado = 100f - 10f * (float)mensajeGlobalModel.Restante / ((float)wares.FirstOrDefault(w => w.Id == ((int)mensajeGlobalModel.Tier + 1)).Duracion * 6f);
            this.Color = Tier2Color(mensajeGlobalModel.Tier);
        }

        private string Tier2Color(Tiers tier)
        {
            switch (tier)
            {
                case Tiers.Rojo:
                    return "rojo";
                case Tiers.Naranja:
                    return "naranja";
                case Tiers.Amarillo:
                    return "amarillo";
                case Tiers.Verde:
                    return "verde";
                case Tiers.Azul:
                    return "azul";
                case Tiers.Blanco:
                    return "blanco";
                default:
                    return "";
            }
        }
    }
}
