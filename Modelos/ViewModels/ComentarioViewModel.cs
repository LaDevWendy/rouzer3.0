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
            this.Nombre = comentario?.Nombre ?? "";
            this.Rango = comentario.Rango;

        }
        public ComentarioViewModel(ComentarioModel comentario, HiloModel hilo = null)
        {
            this.Contenido = comentario.Contenido;
            this.Id = comentario.Id;
            this.Creacion = comentario.Creacion;
            this.Media = comentario.Media;
            this.Nombre = comentario?.Nombre ?? "";
            this.Rango = comentario.Rango;

            if (hilo != null)
            {
                this.EsOp = comentario.UsuarioId == hilo.UsuarioId;

                if(hilo.Flags.Contains("d"))
                {
                    var random = new Random(comentario.Creacion.Millisecond + Creacion.Second);
                    this.Dados = random.Next(10);
                }
            }


        }
        public ComentarioViewModel() {}
        public string Id { get; set; }
        public string Contenido { get; set; }
        public DateTimeOffset Creacion { get; set; }
        public bool EsOp { get; set; }
        public MediaModel Media { get; set; }
        public string Nombre { get; set; }
        public CreacionRango Rango { get; set; }
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
        public int Dados { get; set; } = -1;
        
    }
    public class ComentarioViewModelMod: ComentarioViewModel
    {
        public ComentarioViewModelMod() {}
        public ComentarioViewModelMod(ComentarioModel comentario):base(comentario)
        {

        }
        public string HiloId { get; set; }
        public string UsuarioId { get; set; }
        public ComentarioEstado Estado { get; set; }
        public string Username { get; set; }
    }
}   