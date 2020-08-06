using System;
using System.Linq;
using Modelos;

namespace Data
{
    public class Constantes
    {
        public const int LimiteDeBump = 1000;
        public static Categoria[] Categorias => new Categoria[]
        {
            new Categoria
            {
                Id = 1,
                Nombre = "Arte",
                NombreCorto = "ART",
                Oculta = false,
            },
            new Categoria
            {
                Id = 2,
                Nombre = "Tecnologia",
                NombreCorto = "TEC",
                Oculta = false,
            },
            new Categoria
            {
                Id = 3,
                Nombre = "Random",
                NombreCorto = "UFF",
                Oculta = true,
            },
        };
        static public Categoria[] CantegoriasVisibles => 
            Categorias.Where(e => !e.Oculta).ToArray();
        static public Categoria GetCategoriaPorId(int id) => 
            Categorias.FirstOrDefault(e => e.Id == id);
    }
}
