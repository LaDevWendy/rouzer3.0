using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Modelos;
using NetTools;
using Servicios;

namespace WebApp
{
    public class BanFilter : IAsyncActionFilter
    {
        private readonly RChanContext dbContext;
        private readonly RChanCacheService cacheService;

        public BanFilter(RChanContext dbContext, RChanCacheService cacheService)
        {
            this.cacheService = cacheService;
            this.dbContext = dbContext;
        }
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var ctx = context.HttpContext;
            if (Regex.IsMatch(ctx.Request.Path, @"^\/Domado(?:/[a-zA-Z0-9]*)?") ||
                ctx.Request.Path.Value.Contains("omado"))
            {
                await next();
                return;
            }

            string ip = ctx.Connection.RemoteIpAddress.MapToIPv4().ToString();

            var userId = ctx.User != null ? ctx.User.GetId() : "UndefinedUser";

            if (cacheService.BanCache.IpsBaneadas.Contains(ip) || cacheService.BanCache.IdsBaneadas.Contains(userId))
            {
                var banNoVisto = await dbContext.Bans
                    .OrderByDescending(b => b.Expiracion)
                    .Where(b => !b.Visto)
                    .FirstOrDefaultAsync(b => b.UsuarioId == userId || b.Ip == ip);

                var ahora = DateTimeOffset.Now;
                var banActivo = await dbContext.Bans
                    .OrderByDescending(b => b.Expiracion)
                    .Where(b => b.Visto)
                    .Where(b => b.Expiracion > ahora)
                    .FirstOrDefaultAsync(b => b.UsuarioId == userId || b.Ip == ip);

                if (banNoVisto != null)
                {
                    DomadoRedirect(context);
                    return;
                }

                var permaban = DateTimeOffset.Now + TimeSpan.FromDays(60);
                if ((banActivo != null) && ((ctx.Request.Method == HttpMethods.Post) || (banActivo.Expiracion > permaban)))
                {
                    DomadoRedirect(context);
                    return;
                }
            }
            await next();
        }

        private void DomadoRedirect(ActionExecutingContext context)
        {
            if ((context.HttpContext.Request.Headers["Accept"].FirstOrDefault() ?? "").Contains("json"))
            {
                context.Result = new JsonResult(new { Redirect = "/Domado" });
                return;
            }
            context.HttpContext.Response.Redirect("/Domado");
        }
    }
}