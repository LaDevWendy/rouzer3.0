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
            return (await GetSpams())
                .Where(s => (s.Creacion + s.Duracion) > DateTimeOffset.Now)
                .ToList();
        }

        public async Task Agregar(SpamModel spam)
        {
            spam.Id = hashService.Random(8);
            spam.Creacion = DateTime.Now;

            rChanContext.Add(spam);

            var expirados = await rChanContext.Spams
                .Where(s => (s.Creacion + s.Duracion) < DateTime.Now)
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
