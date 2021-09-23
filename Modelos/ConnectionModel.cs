using System;
using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class Connection : BaseModel
    {
        [Required]
        public string ConnectionID { get; set; }
        public string UserAgent { get; set; }
        public bool Connected { get; set; }
    }
}
