using System;
using System.ComponentModel.DataAnnotations;
using System.Net;
using Newtonsoft.Json;

namespace Modelos
{
    public class CreacionUsuario : BaseModel
    {
        [Required]
        public string UsuarioId { get; set; }
        public MediaModel Media { get; set; }
        public string MediaId { get; set; }
        [JsonIgnore]
        public String Ip { get; set; }
    }
}
