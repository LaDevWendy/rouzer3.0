using System.IO;

namespace Modelos
{
    public class MediaModel : BaseModel
    {
        public string Url { get; set; }
        public string VistaPrevia => $"/P_{Hash}.jpg";
        public string VistaPreviaCuadrado => $"/PC_{Hash}.jpg";
        public string Hash { get; set; }
        public MediaType Tipo { get; set; } = MediaType.Imagen;
        public bool EsGif => Path.GetExtension(Url) == ".gif";
    }
      public enum MediaType
    {
        Imagen,
        Video,
        Youtube,
    }
}