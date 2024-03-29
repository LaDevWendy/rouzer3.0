using Newtonsoft.Json;
using System;
using System.ComponentModel;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Modelos
{
    public class ComentarioViewModel
    {
        private static readonly MD5 md5 = MD5.Create();

        public ComentarioViewModel(ComentarioModel comentario)
        {
            this.Contenido = comentario.Contenido;
            this.Id = comentario.Id;
            this.Creacion = comentario.Creacion;
            this.Media = comentario.Media;
            this.Nombre = comentario?.Nombre ?? "";
            this.Rango = comentario.Rango;
            this.Audio = comentario.Audio;
            this.Sticky = comentario.Sticky;
            this.Ignorado = comentario.Ignorado;
            this.Millon = comentario.Flags.Contains("m") ? comentario.Flags.ToCharArray().Count(c => c == 'm') : 0;
            this.Tactico = comentario.Flags.Contains("t");
            this.Spoiler = comentario.Flags.Contains("p");
            this.Premium = comentario.Flags.Contains("g");
        }

        public ComentarioViewModel(
            ComentarioModel comentario,
            HiloModel hilo = null,
            string requestUsuarioId = null
        )
        {
            this.Contenido = comentario.Contenido;
            this.Id = comentario.Id;
            this.Creacion = comentario.Creacion;
            this.Media = comentario.Media;
            this.Nombre = comentario?.Nombre ?? "";
            this.Rango = comentario.Rango;
            this.Propio = requestUsuarioId == comentario.UsuarioId;
            this.Audio = comentario.Audio;
            this.Sticky = comentario.Sticky;
            this.Ignorado = comentario.Ignorado;
            this.Millon = comentario.Flags.Contains("m") ? comentario.Flags.ToCharArray().Count(c => c == 'm') : 0;
            this.Tactico = comentario.Flags.Contains("t");
            this.Spoiler = comentario.Flags.Contains("p");
            this.Premium = comentario.Flags.Contains("g");

            if (hilo != null)
            {
                this.EsOp = comentario.UsuarioId == hilo.UsuarioId;
                this.OP = requestUsuarioId == hilo.UsuarioId;

                if (hilo.Flags.Contains("d"))
                {
                    var random = new Random(comentario.Creacion.Millisecond + Creacion.Second);
                    this.Dados = random.Next(10);
                }
                if (hilo.Flags.Contains("i") || hilo.Flags.Contains("s"))
                {
                    IdUnico = GenerarIdUnico(hilo.Id, comentario.UsuarioId);
                }
                if (!hilo.Flags.Contains("b") && !hilo.Flags.Contains("s"))
                {
                    this.Banderita = comentario.Pais;
                    /*if (comentario.UsuarioId == "954c1d80-0a87-4e1a-9784-1ffc667c598f")
                    {
                        this.Banderita = "py";
                    }*/
                    if (comentario.UsuarioId == "7c599f68-6195-4d08-b7af-34052d2a3f44")
                    {
                        this.Banderita = "cl";
                    }
                    if (comentario.UsuarioId == "b16d173f-16e4-49c8-992e-5f7e03711f52")
                    {
                        this.Banderita = "ar";
                    }
                    if (
                        !string.IsNullOrEmpty(comentario.Nombre)
                        || comentario.Rango != CreacionRango.Anon
                    )
                    {
                        this.Banderita = null;
                    }
                }
            }
            Color = CalcularColor(hilo);

            var creadorId = comentario.UsuarioId;
            // var r = new Random(BitConverter.GetBytes(creadorId[0])[0]);
            // Banderita = "fi";
            // // Banderita =  r.Next(7) switch
            // //     {
            // //         0  => "ar",
            // //         1 => "bo",
            // //         2 => "cl",
            // //         3 => "mx",
            // //         4 => "il",
            // //         5 => "uy",
            // //         6 => "ve",
            // //         _ => "",
            // //     };
            // if(r.Next(10) == 5) Banderita = r.Next(4) switch
            //     {
            //         0  => "il",
            //         1 => "il",
            //         2 => "il",
            //         3 => "il",
            //         _ => "",
            //     };
        }

        public ComentarioViewModel() { }

        public string Id { get; set; }
        public string Contenido { get; set; }
        public DateTimeOffset Creacion { get; set; }
        public bool EsOp { get; set; }
        public MediaModel Media { get; set; }
        public AudioModel Audio { get; set; }
        public string HiloId { get; set; }

        [
            JsonProperty(
                NullValueHandling = NullValueHandling.Ignore,
                DefaultValueHandling = DefaultValueHandling.Ignore
            ),
            DefaultValue("")
        ]
        public string Nombre { get; set; }

        [
            JsonProperty(
                NullValueHandling = NullValueHandling.Ignore,
                DefaultValueHandling = DefaultValueHandling.Ignore
            ),
            DefaultValue(0)
        ]
        public CreacionRango Rango { get; set; }

        public string IdUnico { get; set; } = "";

        public string Color { get; set; } = "naranja";
        public bool Sticky { get; set; } = false;
        public bool OP { get; set; } = false;
        public bool Ignorado { get; set; } = false;
        public int Millon { get; set; } = 0;
        public bool Tactico { get; set; } = false;
        public bool Spoiler { get; set; } = false;
        public bool Premium { get; set; } = false;

        private string CalcularColor(HiloModel hilo = null)
        {
            if (this.Millon > 0) return "uff";
            var r = new Random(
                Creacion.Millisecond
                    + Creacion.Second * 60
                    + Creacion.Minute * 60 * 60
                    + Creacion.Hour * 60 * 60 * 60
                    + Creacion.Day * 60 * 60 * 60 * 24
            );

            //Tactico
            var n = 100000;
            if (hilo != null && hilo.Flags.Contains("t"))
            {
                n /= 10;
                if (hilo.Flags.ToCharArray().Count(c => c == 't') > 1)
                {
                    n /= 10;
                }
            }
            if (this.Tactico)
            {
                n /= 10;
            }
            if (r.Next(n) == 7)
            {

                return "tactico";
            }

            //Serio
            if (hilo != null && hilo.Flags.Contains("s"))
                return "serio";

            // Black
            const int categoriaParanormal = 15;
            if (hilo != null && hilo.CategoriaId == categoriaParanormal)
            {
                // var paraguayTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Paraguay Standard Time");
                var horaParaguay = Creacion.ToUniversalTime().AddHours(-3);

                if (horaParaguay.Hour < 7 && horaParaguay.Hour >= 0 && r.Next(1000) == 666)
                    return "negro";
            }

            if (r.Next(10000) == 9)
            {
                r.Next();
                return r.Next(4) switch
                {
                    0 => "rose-violeta",
                    1 => "rose-castaña",
                    2 => "rose-azul",
                    3 => "rose-rubia",
                    _ => "",
                };
            }
            if (r.Next(10000) == 10)
                return "navideño";
            if (r.Next(5000) == 13)
                return "blanco";
            if (r.Next(2000) == 11)
                return "ario";

            if (r.Next(200) == 2)
            {
                return r.Next(3) switch
                {
                    0 => "marron",
                    1 => "rosa",
                    2 => "invertido",
                    _ => "",
                };
            }

            if (r.Next(100) == 12)
            {
                return r.Next(2) switch
                {
                    0 => "ruso",
                    1 => "ucraniano",
                    _ => "",
                };
            }

            if (r.Next(20) == 10)
                return "multi";

            const int categoriaGold = 47;
            if (hilo != null && hilo.CategoriaId == categoriaGold)
            {
                return r.Next(5) switch
                {
                    0 => "amarillo",
                    1 => "azul",
                    2 => "rojo",
                    3 => "verde",
                    4 => "naranja",
                    _ => "",
                };
            }

            return r.Next(4) switch
            {
                0 => "amarillo",
                1 => "azul",
                2 => "rojo",
                3 => "verde",
                _ => "",
            };

        }

        public int Dados { get; set; } = -1;
        public string Banderita { get; set; }
        public bool Propio { get; set; }

        static protected string GenerarIdUnico(string hiloId, string usuarioId)
        {
            var random = new Random((hiloId + usuarioId).GetHashCode());
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(
                Enumerable.Repeat(chars, 3).Select(s => s[random.Next(s.Length)]).ToArray()
            );
        }

        private int HashString(string str)
        {
            var hashed = md5.ComputeHash(Encoding.UTF8.GetBytes(str));
            var ivalue = BitConverter.ToInt32(hashed, 0);
            return ivalue;
        }
    }

    public class ComentarioViewModelMod : ComentarioViewModel
    {
        public ComentarioViewModelMod() { }

        public ComentarioViewModelMod(ComentarioModel comentario) : base(comentario)
        {
            UsuarioId = comentario.UsuarioId;
        }

        public ComentarioViewModelMod(
            ComentarioModel comentario,
            HiloModel hilo,
            string clientUsuarioId = null
        ) : base(comentario, hilo, clientUsuarioId)
        {
            UsuarioId = comentario.UsuarioId;
            Estado = comentario.Estado;
        }

        public string UsuarioId { get; set; }
        public ComentarioEstado Estado { get; set; }
        public string Username { get; set; }
        public UsuarioModel Usuario { get; set; }
    }
}
