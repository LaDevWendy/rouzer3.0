using System;
using System.Threading.Tasks;

namespace WebApp.Otros
{
    public class Cache<T>
    {
        public DateTimeOffset UltimaActualizacion { get; private set; }
        public TimeSpan TiempoEntreActualizaciones { get; set; }
        
        private Func<Task<T>> actualizar = null;
        private T DatosCache;

        public Cache(Func<Task<T>> funcionActualizar, TimeSpan timpoEntreActualizaciones)
        {
            actualizar = funcionActualizar;
            TiempoEntreActualizaciones = timpoEntreActualizaciones;
        }

        public async Task Actualizar(Func<Task<T>> actualizar = null) 
        {
            if(actualizar == null) DatosCache = await  actualizar();
        }

        public async Task<T> GetDatosAsync() {
            if(UltimaActualizacion < DateTimeOffset.Now - TiempoEntreActualizaciones || DatosCache is null) 
            {
                DatosCache =  await actualizar();
            }
            UltimaActualizacion = DateTimeOffset.Now;
            return DatosCache;
        }
    }
}