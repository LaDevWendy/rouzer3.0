
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Modelos;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;

namespace WebApp
{
    public class RChanHub : Hub
    {
        public static ConcurrentDictionary<string, bool> usuariosConectados = new ConcurrentDictionary<string, bool>();

        public static ConcurrentDictionary<string, OnlineUser> nombreUsuariosConectados = new ConcurrentDictionary<string, OnlineUser>();

        public static ConcurrentDictionary<string, OnlineUser> NombresUsuariosConectados => nombreUsuariosConectados;

        public static int NumeroDeUsuariosConectados => usuariosConectados.Count;

        public RChanHub()
        {
        }

        public async Task SubscribirseAHilo(string hiloId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, hiloId);
        }
        public async Task SubscribirAHome()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "home");
        }

        [Authorize("esAdmin")]
        public async Task SubscribirAAdministracion()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "administracion");
        }

        [Authorize("esAuxiliar")]
        public async Task SubscribirAModeracion()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "moderacion");
        }

        [AllowAnonymous]
        public async Task SubscribirARozed()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "rozed");
        }

        public override async Task OnConnectedAsync()
        {
            var ip = Context.GetHttpContext().Connection.RemoteIpAddress.MapToIPv4().ToString();

            if (!usuariosConectados.Keys.Any(x => x == ip))
            {
                usuariosConectados.TryAdd(ip, true);
            }

            try
            {
                var nombre = Context.User.Identity.Name;
                if (!string.IsNullOrEmpty(nombre))
                {
                    OnlineUser onlineUser;
                    if (!nombreUsuariosConectados.Keys.Any(x => x == nombre))
                    {
                        onlineUser = new OnlineUser();
                        onlineUser.NConexiones = 1;
                        onlineUser.UltimaConexion = DateTime.Now;
                        nombreUsuariosConectados.TryAdd(nombre, onlineUser);
                    }
                    else
                    {
                        nombreUsuariosConectados.TryGetValue(nombre, out onlineUser);
                        OnlineUser newOnlineUser = new OnlineUser();
                        newOnlineUser.NConexiones = onlineUser.NConexiones + 1;
                        newOnlineUser.UltimaConexion = DateTime.Now;
                        nombreUsuariosConectados.TryUpdate(nombre, newOnlineUser, onlineUser);
                    }
                }
            }
            catch (Exception e)
            {

            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var ip = Context.GetHttpContext().Connection.RemoteIpAddress.MapToIPv4().ToString();

            usuariosConectados.TryRemove(ip, out var jeje);

            try
            {
                var nombre = Context.User.Identity.Name;
                if (!string.IsNullOrEmpty(nombre))
                {
                    if (nombreUsuariosConectados.Keys.Any(x => x == nombre))
                    {
                        OnlineUser onlineUser;
                        nombreUsuariosConectados.TryGetValue(nombre, out onlineUser);
                        OnlineUser newOnlineUser = new OnlineUser();
                        newOnlineUser.NConexiones = onlineUser.NConexiones - 1;
                        if (newOnlineUser.NConexiones <= 0)
                        {
                            newOnlineUser.UltimaConexion = DateTime.Now;
                        }
                        else
                        {
                            newOnlineUser.UltimaConexion = onlineUser.UltimaConexion;
                        }
                        nombreUsuariosConectados.TryUpdate(nombre, newOnlineUser, onlineUser);
                    }
                }
            }
            catch (Exception e)
            {

            }
            await base.OnDisconnectedAsync(exception);
        }

        public struct OnlineUser

        {
            public int NConexiones { get; set; }
            public DateTime UltimaConexion { get; set; }
        }

    }

    public interface IRchanHub
    {
        Task HiloCreado(HiloModel hilo);
        Task HiloComentado(string hiloId, string comentario = "");
    }
}
