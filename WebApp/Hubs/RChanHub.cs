
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Modelos;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System;
using Servicios;
using System.Collections.Concurrent;
using System.Linq;

namespace WebApp
{
    public class RChanHub : Hub
    {
        public static ConcurrentDictionary<string, bool> usuariosConectados = new ConcurrentDictionary<string, bool>();
        
        public static ConcurrentDictionary<string, int> nombreUsuariosConectados = new ConcurrentDictionary<string, int>();

        public static ConcurrentDictionary<string, int> NombresUsuariosConectados => nombreUsuariosConectados;
        
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
            
            try {
                var nombre = Context.User.Identity.Name;
                if (!string.IsNullOrEmpty(nombre)){
                    if (!nombreUsuariosConectados.Keys.Any(x => x == nombre))
                    {
                        nombreUsuariosConectados.TryAdd(nombre, 1);
                    }
                    else 
                    {
                        int n = nombreUsuariosConectados[nombre];
                        n++;
                        nombreUsuariosConectados[nombre] = n;
                    }
                }
            }
            catch (Exception e){
                
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var ip = Context.GetHttpContext().Connection.RemoteIpAddress.MapToIPv4().ToString();
            
            usuariosConectados.TryRemove(ip, out var jeje);
            
            try {
                var nombre = Context.User.Identity.Name;
                if (!string.IsNullOrEmpty(nombre)){
                    if (nombreUsuariosConectados.Keys.Any(x => x == nombre))
                    {
                        int n = nombreUsuariosConectados[nombre];
                        n--;
                        if (n <= 0){
                            nombreUsuariosConectados.TryRemove(nombre, out var jijo);
                        } else {
                            nombreUsuariosConectados[nombre] = n;
                        }
                    }
                }
            } 
            catch (Exception e){
                
            }
            
            await base.OnDisconnectedAsync(exception);
        }

    }

    public interface IRchanHub
    {
        Task HiloCreado(HiloModel hilo);
        Task HiloComentado(string hiloId, string comentario="");
    }
}
