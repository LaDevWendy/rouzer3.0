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
using Servicios;

namespace WebApp
{
    public class BanFilter : IAsyncActionFilter
    {
        private readonly SignInManager<UsuarioModel> sm;
        private readonly RChanContext dbContext;
        private readonly RChanCacheService cacheService;

        public BanFilter(SignInManager<UsuarioModel> sm, RChanContext dbContext, RChanCacheService cacheService)
        {
            this.cacheService = cacheService;
            this.sm = sm;
            this.dbContext = dbContext;
        }
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var ctx = context.HttpContext;
            if (Regex.IsMatch(ctx.Request.Path, @"^/Domado") || ctx.Request.Path.Value.Contains("omado"))
            {
                await next();
                return;
            }

            string ip = ctx.Connection.RemoteIpAddress.MapToIPv4().ToString();

            if (ctx.User != null && 
                (cacheService.banCache.IpsBaneadas.Contains(ip) || cacheService.banCache.IdsBaneadas.Contains(ctx.User.GetId())))
            {

                var banNoVisto = await dbContext.Bans
                    .OrderByDescending(b => b.Expiracion)
                    .Where(b => !b.Visto)
                    .FirstOrDefaultAsync(b => b.UsuarioId == ctx.User.GetId() || b.Ip == ip);

                var ahora = DateTime.Now;
                var banActivo = await dbContext.Bans
                    .OrderByDescending(b => b.Expiracion)
                    .Where(b => b.Visto)
                    .Where(b => b.Expiracion > ahora)
                    .FirstOrDefaultAsync(b => b.UsuarioId == ctx.User.GetId() || b.Ip == ip);

                if (banNoVisto != null)
                {
                    DomadoRedirect(context);
                    return;
                }

                if (banActivo != null && ctx.User.Identity.IsAuthenticated && ctx.Request.Method == HttpMethods.Post)
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