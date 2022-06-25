using Data;
using Microsoft.EntityFrameworkCore;
using Modelos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Servicios
{
    public class SpamService
    {
        private readonly RChanContext rChanContext;
        private readonly HashService hashService;
        private static List<SpamModel> spams;

        public SpamService(
            RChanContext rChanContext,
            HashService hashService
        )
        {
            this.rChanContext = rChanContext;
            this.hashService = hashService;
        }

        public async Task<List<SpamModel>> GetSpams()
        {
            if (spams is null) spams = await rChanContext.Spams.ToListAsync();
            return spams;
        }

        public async Task<List<SpamModel>> GetSpamsActivos()
        {
            var ahora = DateTimeOffset.Now;
            return (await GetSpams())
                .Where(s => (s.Creacion + s.Duracion) > ahora)
                .ToList();
        }

        public async Task Agregar(SpamModel spam)
        {
            spam.Id = hashService.Random(8);
            spam.Creacion = DateTimeOffset.Now;

            rChanContext.Add(spam);

            var ahora = DateTimeOffset.Now;
            var expirados = await rChanContext.Spams
                .Where(s => (s.Creacion + s.Duracion) < ahora)
                .ToListAsync();

            rChanContext.RemoveRange(expirados);
            await rChanContext.SaveChangesAsync();
            spams = await rChanContext.Spams.ToListAsync();
        }

        public async Task Remover(string id)
        {
            var expirados = await rChanContext.Spams
                .Where(s => s.Id == id)
                .ToListAsync();

            rChanContext.RemoveRange(expirados);
            await rChanContext.SaveChangesAsync();

            spams = await rChanContext.Spams.ToListAsync();
        }
    }
}
