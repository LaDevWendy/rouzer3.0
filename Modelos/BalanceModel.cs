using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class BalanceModel : BaseModel
    {
        [Required]
        public string UsuarioId { get; set; }
        public UsuarioModel Usuario { get; set; }
        [Required]
        public float Balance { get; set; } = 0.0f;
    }
}
