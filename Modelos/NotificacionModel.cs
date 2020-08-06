using System;
using System.ComponentModel.DataAnnotations;

namespace Modelos
{
    public class NotificacionModel
    {
        [Required]
        public string Id { get; set; }
        public string UsuarioId { get; set; }
        public string HiloId { get; set; }
        public string ComentarioId { get; set; } //Si el tipo es comentario, indica la id del comentario respondido
        public NotificacionType Tipo { get; set; }
        public DateTimeOffset Actualizacion { get; set; }
        public int Conteo { get; set; } = 1;

        public ComentarioModel Comentario { get; set; }
        public HiloModel HiloModel { get; set; }
    }

    public enum NotificacionType {
        Comentario,
        Respuesta
    }
}
