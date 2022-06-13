using Microsoft.AspNetCore.Mvc;

namespace WebApp.Controllers
{
    public class ChocamoController : Controller
    {
        [Route("/Chocamo")]
        public ActionResult Index()
        {
            return View("Chocamo");
        }
    }
}