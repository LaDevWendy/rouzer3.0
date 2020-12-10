using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Modelos
{

    public class AccionDeModeracion:BaseModel
    {
        public string UsuarioId { get; set; }

        [Required]
        public TipoElemento Tipo { get; set; }

        public string HiloId { get; set; }
        public string ComentarioId { get; set; }
        public string Nota { get; set; } = "";

        public HiloModel Hilo { get; set; }
        public ComentarioModel Comentario { get; set; }
        public UsuarioModel Usuario { get; set; }


    }

    enum TipoAccion
    {
        ComentarioBorrado,
        HiloBorrado,
        CategoriaCambiada,
        DenunciaRechazada,

    }

}
