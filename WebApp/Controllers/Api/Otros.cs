using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

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