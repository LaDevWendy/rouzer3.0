using System;
using System.Threading.Tasks;

namespace Servicios
{
    interface IAntiFloodService
    {
        Task<bool> PuedeCrearHilo(string userId);
        Task<bool> PuedeComentar(string userId);
    }

    public class AntiFloodService
    {
    }
}
