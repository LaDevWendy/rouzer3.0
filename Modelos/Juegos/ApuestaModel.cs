using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class ApuestaModel : BaseModel
    {
        public string UsuarioId { get; set; }
        public UsuarioModel Usuario { get; set; }
        public string JuegoId { get; set; }
        public JuegoModel Juego { get; set; }
        public string ComentarioId { get; set; }
        public ComentarioModel Comentario { get; set; }
        public string Apuesta { get; set; }
        public float Cantidad { get; set; }
        public string TransaccionId { get; set; }
        public TransaccionModel Transaccion { get; set; }
    }
}
