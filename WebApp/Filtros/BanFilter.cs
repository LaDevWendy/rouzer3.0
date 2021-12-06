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
        private readonly HashService hashService;
        private readonly AccionesDeModeracionService historial;

        public BanFilter(SignInManager<UsuarioModel> sm, RChanContext dbContext, RChanCacheService cacheService, HashService hashService, AccionesDeModeracionService historial)
        {
            this.cacheService = cacheService;
            this.sm = sm;
            this.dbContext = dbContext;
            this.hashService = hashService;
            this.historial = historial;
        }
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var ctx = context.HttpContext;
            if (Regex.IsMatch(ctx.Request.Path, @"^/Domado") || ctx.Request.Path.Value.Contains("omado"))
            {
                await next();
                return;
            }

            string fingerPrint = "jejeTaBien";
            if (context.ActionArguments.ContainsKey("vm"))
            {
                var vm = (CrearViewModel)context.ActionArguments["vm"];
                fingerPrint = vm.FingerPrint;
            }

            string ip = ctx.Connection.RemoteIpAddress.MapToIPv4().ToString();

            if (ctx.User != null && (cacheService.banCache.IpsBaneadas.Contains(ip) || cacheService.banCache.IdsBaneadas.Contains(ctx.User.GetId()) || cacheService.banCache.FingerPrintsBaneadas.Contains(fingerPrint)))
            {

                var banNoVisto = await dbContext.Bans
                    .OrderByDescending(b => b.Expiracion)
                    .Where(b => !b.Visto)
                    .FirstOrDefaultAsync(b => b.UsuarioId == ctx.User.GetId() || b.Ip == ip || b.FingerPrint == fingerPrint);

                var ahora = DateTime.Now;
                var banActivo = await dbContext.Bans
                    .OrderByDescending(b => b.Expiracion)
                    .Where(b => b.Visto)
                    .Where(b => b.Expiracion > ahora)
                    .FirstOrDefaultAsync(b => b.UsuarioId == ctx.User.GetId() || b.Ip == ip || b.FingerPrint == fingerPrint);

                if (banActivo != null && banActivo.Ip != ip && banActivo.UsuarioId != ctx.User.GetId() && banActivo.FingerPrint == fingerPrint)
                {
                    var ban = new BaneoModel
                    {
                        Id = hashService.Random(),
                        Aclaracion = banActivo.Aclaracion,
                        ComentarioId = banActivo.ComentarioId,
                        Creacion = DateTime.Now,
                        Expiracion = banActivo.Expiracion,
                        ModId = banActivo.ModId,
                        Motivo = banActivo.Motivo,
                        Tipo = banActivo.Tipo,
                        HiloId = banActivo.HiloId,
                        Ip = ip,
                        UsuarioId = ctx.User.GetId(),
                        FingerPrint = banActivo.FingerPrint
                    };
                    dbContext.Bans.Add(ban);
                    await dbContext.SaveChangesAsync();
                    await historial.RegistrarBan(ban.ModId, ban);
                }

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