using System;

namespace Modelos {
    public class SpamModel
    {
        public string Id { get; set; }
        public DateTimeOffset Creacion { get; set; }
        public TimeSpan Duracion { get; set; }
        public bool Nsfw { get; set; }
        public string Link { get; set; }
        public string UrlImagen { get; set; }
    }
}