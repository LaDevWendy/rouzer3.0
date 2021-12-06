using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class CrearComentarioViewModel : CrearViewModel
    {
        [Required]
        public string HiloId { get; set; }
        [MaxLength(3000, ErrorMessage = "Pero este comentario es muy largo padre")]
        public new string Contenido { get; set; } = "";
    }
}
