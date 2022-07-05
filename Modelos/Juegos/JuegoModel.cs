using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class JuegoModel : BaseModel
    {
        public JuegoEstado Estado { get; set; } = JuegoEstado.Abierto;
        public DateTimeOffset Expiracion { get; set; } = DateTimeOffset.Now + TimeSpan.FromMinutes(5);
        public string HiloId { get; set; }
        public HiloModel Hilo { get; set; }
        public TipoJuego Tipo { get; set; }
        public int[] ApuestasValidas => Tipo == TipoJuego.Duelo ?
            Enumerable.Range(0, 2).ToArray() : Tipo == TipoJuego.Ruleta ?
            Enumerable.Range(0, 37).ToArray() : null;
        public int NumeroParticipantesMinimo => Tipo == TipoJuego.Duelo ?
            2 : Tipo == TipoJuego.Ruleta ?
            1 : 0;
        public int[] ApuestasIgnoradasAlResolver => Tipo == TipoJuego.Duelo ?
            Array.Empty<int>() : Tipo == TipoJuego.Ruleta ?
            Enumerable.Range(0, 1).ToArray() : null;
        public float Bonus => 0.005f;
    }
    public enum JuegoEstado
    {
        Abierto,
        Cerrado
    }
    public enum TipoJuego
    {
        Duelo,
        Ruleta
    }

}
