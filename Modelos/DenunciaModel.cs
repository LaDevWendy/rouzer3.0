using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class DenunciaModel
    {   
        public string Id { get; set; }
        public DateTimeOffset Creacion { get; set; } = DateTimeOffset.Now;
        public string UsuarioId { get; set; } = "Anonimo";
        [Required]
        public Tipo Tipo { get; set; }
        [Required]
        public string HiloId { get; set; }
        public string ComentarioId { get; set; }
        [Required]
        public string Motivo { get; set; }
        public string Aclaracion { get; set; } = "";

        public EstadoDenuncia  Estado { get; set; } = EstadoDenuncia.NoRevisada;

        public HiloModel Hilo { get; set; }
        public ComentarioModel Comentario { get; set; }
    }

    public enum MotivoDenuncia
    {
        CategoriaIncorrecta,
        Spam,
        Avatarfageo,
        Doxxeo,
        CoentenidoIlegal,
    }
    public enum Tipo
    {
        Hilo,
        Comentario
    }
    public enum EstadoDenuncia
    {
        Aceptada,
        Rechazada,
        NoRevisada
    }
}
