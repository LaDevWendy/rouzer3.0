using System.IO;
using Newtonsoft.Json;

namespace Modelos
{
    public class MediaModel : BaseModel
    {
        public string Url { get; set; }
        public string VistaPrevia =>  Tipo != MediaType.Eliminado? $"/Media/P_{Hash}.jpg": "";
        public string VistaPreviaCuadrado =>  Tipo != MediaType.Eliminado? $"/Media/PC_{Hash}.jpg": "";
        [JsonIgnore, System.Text.Json.Serialization.JsonIgnore]
        public string VistaPreviaLocal =>  Tipo != MediaType.Eliminado? $"/P_{Hash}.jpg": "";
        [JsonIgnore, System.Text.Json.Serialization.JsonIgnore]
        public string VistaPreviaCuadradoLocal =>  Tipo != MediaType.Eliminado? $"/PC_{Hash}.jpg": "";
        public string Hash { get; set; }
        public MediaType Tipo { get; set; } = MediaType.Imagen;
        public bool EsGif => Path.GetExtension(Url) == ".gif";
    }
      public enum MediaType
    {
        Imagen,
        Video,
        Youtube,
        Eliminado,
    }
}