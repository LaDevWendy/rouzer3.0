using Microsoft.AspNetCore.Mvc;

namespace WebApp.Controllers
{
    [Route("/Error")]
    public class ErrorController : Controller
    {

        public ErrorController()
        {

        }
        public IActionResult Index()
        {
            return View();
        }

        [Route("/Error/{id}")]
        public IActionResult PageNotFound(string id)
        {
            return View("PageNotFound");
        }
    }
}
