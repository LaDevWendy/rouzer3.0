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
            var configviejo = this;
            await File.WriteAllTextAsync(ubicacion, JsonSerializer.Serialize(configviejo, new JsonSerializerOptions{
                WriteIndented = true,
            }));
        }
        
    }

}
