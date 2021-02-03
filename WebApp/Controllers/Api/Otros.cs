using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore;
using Microsoft.Extensions.Logging;
using Servicios;
using System.Collections.Generic;
using Modelos;
using System.Threading.Tasks;
using System.Net;
using System;
using WebApp;
using Microsoft.AspNetCore.Authorization;
using Data;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.IO;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Hosting;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Text;

namespace WebApp.Controllers
{
    [AllowAnonymous]
    [ApiController, Route("api/Otros/{action}/{id?}")]
    public class Otros : Controller 
    {  
        public async Task<IActionResult> YoutubeAARchivo([FromQuery] string url) 
        {
            return Json(new 
            {
                Link = await YoutubeDownloader.GenerarLinkDeDescarga(url)
            });
         } 
    }
}