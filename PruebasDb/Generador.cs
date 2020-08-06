using Modelos;
using Bogus;
using System.Collections.Generic;
using System.Linq;
//using Dapper;
using SqlKata.Execution;

namespace PruebasDb
{
    public class Generador
    {
        public List<HiloModel> GenerarHilos(int cantidad, IEnumerable<UsuarioModel> usuarios)
        {
            var usersIds = usuarios.Select(u => u.Id).ToList();
            var generador = new Faker<HiloModel>()
                .RuleFor(h => h.Creacion, (f, h) => f.Date.Recent())
                .RuleFor(h => h.Bump, (f, h) => f.Date.Recent())
                .RuleFor(h => h.Contenido, (f, h) => f.Lorem.Sentence())
                .RuleFor(h => h.Titulo, (f, h) => f.Lorem.Sentence())
                .RuleFor(h => h.CategoriaId, (f, h) => f.PickRandom(new int[]{1,2,3}))
                .RuleFor(h => h.Id, (f, h) => f.Random.Hash(20, true))
                .RuleFor(h => h.UsuarioId, (f, h) => f.PickRandom(usersIds));

            return generador.Generate(cantidad);
        }
        public List<HiloModel> GenerarHilos(int cantidad)
        {
            var usuarios = GenerarUsuarios(cantidad);
            return GenerarHilos(cantidad, usuarios);
        }

        public List<UsuarioModel> GenerarUsuarios(int cantidad)
        {
            var generador = new Faker<UsuarioModel>()
                .RuleFor(u => u.Id, f => f.Random.Hash(20, true));
            return generador.Generate(cantidad);
        }

        public List<ComentarioModel> GenerarComentarios(int cantidad, IEnumerable<UsuarioModel> usuarios, IEnumerable<HiloModel> hilos)
        {
            var hiloIds = hilos.Select(i => i.Id).ToList();
            var usersIds = usuarios.Select(u => u.Id).ToList();

            var generador = new Faker<ComentarioModel>()
                .RuleFor(c => c.HiloId, f => f.PickRandom(hiloIds))
                .RuleFor(h => h.Id, (f, h) => f.Random.Hash(20, true))
                .RuleFor(c => c.UsuarioId, f => f.PickRandom(usersIds))
                .RuleFor(h => h.Contenido, (f, h) => f.Lorem.Sentence());
            return generador.Generate(cantidad);

        }

    }
}
