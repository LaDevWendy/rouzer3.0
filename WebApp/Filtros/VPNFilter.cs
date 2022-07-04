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
using Microsoft.Extensions.Options;
using Modelos;
using NetTools;
using Servicios;

namespace WebApp
{
    public class VPNFilter : IAsyncActionFilter
    {
        private readonly RChanCacheService cacheService;
        private readonly IOptionsSnapshot<GeneralOptions> grlOpts;

        public VPNFilter(IOptionsSnapshot<GeneralOptions> grlOpts, RChanCacheService cacheService)
        {
            this.cacheService = cacheService;
            this.grlOpts = grlOpts;
        }
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var ctx = context.HttpContext;
            if (Regex.IsMatch(ctx.Request.Path, @"^\/Error\/Prohibido(?:/[a-zA-Z0-9]*)?") ||
                ctx.Request.Path.Value.Contains("rohibido"))
            {
                await next();
                return;
            }

            if (grlOpts.Value.ProhibirVPNs)
            {
                string ip = ctx.Connection.RemoteIpAddress.MapToIPv4().ToString();
                var listaVPNs = cacheService.ListaVPNs;

                if (!cacheService.IpsSeguras.Keys.Any(x => x == ip))
                {
                    var ipParsed = IPAddressRange.Parse(ip);
                    int n = 0;
                    foreach (var vpn in listaVPNs)
                    {
                        if (!String.IsNullOrEmpty(vpn))
                        {
                            var range = IPAddressRange.Parse(vpn);
                            if (range.Contains(ipParsed))
                            {
                                VPNRedirect(context);
                                return;
                            }
                            n++;
                        }
                    }
                    if (n > 0)
                    {
                        //Console.WriteLine("ip segura agregada");
                        cacheService.IpsSeguras.TryAdd(ip, true);
                    }
                    /*else
                    {
                        Console.WriteLine("no se puede saber");
                    }*/
                }
                /*else
                {
                    Console.WriteLine("la ip es segura");
                }*/
            }

            await next();
        }

        private void VPNRedirect(ActionExecutingContext context)
        {
            if ((context.HttpContext.Request.Headers["Accept"].FirstOrDefault() ?? "").Contains("json"))
            {
                context.Result = new JsonResult(new { Redirect = "/Error/Prohibido" });
                return;
            }
            context.HttpContext.Response.Redirect("/Error/Prohibido");
        }
    }
}