using System.IO;

namespace Modelos
{
    public class MediaModel : BaseModel
    {
        public string Url { get; set; }
        public string VistaPrevia =>  Tipo != MediaType.Eliminado? $"/P_{Hash}.jpg": "";
        public string VistaPreviaCuadrado =>  Tipo != MediaType.Eliminado? $"/PC_{Hash}.jpg": "";
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