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
            if (id == "Prohibido")
            {
                return View("Prohibido");
            }
            return View("PageNotFound");
        }
    }
}
