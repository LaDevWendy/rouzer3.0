using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace WebApp
{
    public class GeneralOptions {
        public int LimiteBump { get; set; }
        public int TiempoEntreComentarios { get; set; }
        public int TiempoEntreHilos { get; set; }
        public bool RegistroAbierto { get; set; }
        public int HilosMaximosPorCategoria { get; set; }
        public int LimiteArchivo { get; set; }

        public async Task Guardar(string ubicacion) {
            var configviejo = JsonSerializer.Deserialize<AppOptions>(await File.ReadAllTextAsync(ubicacion));
            configviejo.General = this;
            await File.WriteAllTextAsync(ubicacion, JsonSerializer.Serialize(configviejo, new JsonSerializerOptions{
                WriteIndented = true,
            }));
        }
        
        private class AppOptions
        {
            public GeneralOptions General { get; set; }
            public string AllowedHosts { get; set; }
            public Connection ConnectionStrings { get; set; }
            public Log Logging { get; set; }

            public class Connection
            {
                public string DefaultConnection { get; set; }
            }

            public class Log
            {
                public LogLevel LogLevel { get; set; }

            }
            public class LogLevel
            {
                public string Default { get; set; }
                public string Microsoft { get; set; }
                [JsonPropertyName("Microsoft.Hosting.Lifetime")]
                public string Lifetime { get; set; }
            }
        }
    }

}
