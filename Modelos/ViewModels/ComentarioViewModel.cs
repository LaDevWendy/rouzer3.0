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
                var r = new Random(Creacion.Millisecond + Creacion.Second);

                if(r.Next(200) == 2) 
                {
                    return r.Next(2) switch {
                        0 => "marron",
                        1 => "rosa",
                        _ => "",};
                }

                if(r.Next(20) == 10) return "multi";


                return r.Next(4) switch {
                    0 => "amarillo",
                    1 => "azul",
                    2 => "rojo",
                    3 => "verde",
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