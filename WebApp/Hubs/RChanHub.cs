
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Modelos;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System;

namespace WebApp
{
    public class RChanHub : Hub
    {
        public static HashSet<string> usuariosConectados = new HashSet<string>();

        public static int NumeroDeUsuariosConectados => RChanHub.usuariosConectados.Count;

        public async Task SubscribirseAHilo(string hiloId)
        {
           await Groups.AddToGroupAsync(Context.ConnectionId, hiloId);
        }
        public async Task SubscribirAHome()
        {
           await Groups.AddToGroupAsync(Context.ConnectionId, "home");
        }

        [Authorize("esAuxiliar")]
        public async Task SubscribirAModeracion()
        {
           await Groups.AddToGroupAsync(Context.ConnectionId, "moderacion");
        }

            public override Task OnConnectedAsync()
        {
            usuariosConectados.Add(Context.UserIdentifier);
            Clients.All.SendAsync("estadisticas", RChanHub.NumeroDeUsuariosConectados);
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            usuariosConectados.Remove(Context.UserIdentifier);
            Clients.All.SendAsync("estadisticas", RChanHub.NumeroDeUsuariosConectados);
            return base.OnDisconnectedAsync(exception);
        }

    }

    public interface IRchanHub
    {
        Task HiloCreado(HiloModel hilo);
        Task HiloComentado(string hiloId, string comentario="");
    }
}