using System.Collections.Generic;
using System.Linq;

namespace Modelos
{
    public class Categoria
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string NombreCorto { get; set; }
        public bool Nsfw { get; set; }
        public bool Public { get; set; }
        public bool Limit { get; set; }
        public bool Premium { get; set; }
    }

    public static class CategoriaExtensiones
    {
        public static List<Categoria> Sfw(this List<Categoria> categorias)
        {
            return categorias.Where(c => !c.Nsfw).ToList();
        }
        public static List<int> Ids(this List<Categoria> categorias)
        {
            return categorias.Select(c => c.Id).ToList();
        }
        public static List<Categoria> Public(this List<Categoria> categorias)
        {
            return categorias.Where(c => c.Public).ToList();
        }
        public static List<Categoria> Premium(this List<Categoria> categorias)
        {
            return categorias.Where(c => c.Premium).ToList();
        }

    }
}
