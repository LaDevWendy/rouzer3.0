using System;
using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class AudioModel : BaseModel
    {
        [Required]
        public string Url { get; set; }
    }
}
