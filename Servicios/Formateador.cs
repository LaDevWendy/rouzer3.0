using System.Collections.Generic;
using System.Linq;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;

namespace Servicios 
{
    public class FormateadorService
    {
        private readonly HtmlEncoder encoder;

        public FormateadorService( HtmlEncoder encoder)
        {
            this.encoder = encoder;
        }

        public string Parsear(string contenido) {
            var tags = new List<string>();
            return string.Join("\n", contenido.Split("\n").Select(t => {
                t = encoder.Encode(t);
                var esLink = false;
                //Links
                t = Regex.Replace(t, @"&gt;(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)", m => {
                    var link = m.Value.Replace("&gt;", "");
                    esLink = true;
                    return $@"<a href=""{link}"" target=""_blank"">&gt{link}</a>";
                });
                if(esLink) return t;
                //Respuestas
                t =  Regex.Replace(t, @"&gt;&gt;([A-Z0-9]{8})", m => {
                    if(tags.Contains(m.Value)) return "";
                    tags.Add(m.Value);
                    var id = m.Groups[1].Value;
                    return $"<a href=\"#{id}\" class=\"restag\" r-id=\" {id}\">&gt;&gt;{id}</a>";
                });

                //Texto verde
                t = Regex.Replace(t.Replace("&#xA;", "\n"),@"&gt;(?!https?).+(?:$|\n)", m => {
                    if(m.Value.Contains("&gt;&gt;") || m.Value.Contains("href")) return m.Value;
                    var text = m.Value.Replace("&gt;", "");
                    return $@"<span class=""verde"">&gt;{text}</span>";
                });
                return t;
            }));
        }
    }
}