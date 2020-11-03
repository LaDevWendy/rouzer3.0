using System;
using Modelos;

namespace Modelos
{
    public class ComentarioViewModel
    {
        public ComentarioViewModel(ComentarioModel comentario)
        {
            this.Contenido = comentario.Contenido;
            this.Id = comentario.Id;
            this.Creacion = comentario.Creacion;
            this.Media = comentario.Media;

        }
        public ComentarioViewModel() {}
        public string Id { get; set; }
        public string Contenido { get; set; }
        public DateTimeOffset Creacion { get; set; }
        public bool EsOp { get; set; }
        public MediaModel Media { get; set; }
        public string Color   {
            get {
                var r = new Random(Creacion.Millisecond );
                return r.Next(5) switch {
                    1 => "blue",
                    2 => "orange",
                    3 => "red",
                    4 => "green",
                    0 => "yellow",
                    _ => "",
                };
            }
        }
        
    }
    public class ComentarioViewModelMod: ComentarioViewModel
    {
        public string HiloId { get; set; }
        public string UsuarioId { get; set; }
        public string Username { get; set; }
    }
}