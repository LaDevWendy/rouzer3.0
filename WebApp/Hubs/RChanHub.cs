
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Modelos;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System;
using Servicios;

namespace WebApp
{
    public class RChanHub : Hub
    {
        public static HashSet<string> usuariosConectados = new HashSet<string>();
        private readonly EstadisticasService estadisticasService;

        public static int NumeroDeUsuariosConectados => RChanHub.usuariosConectados.Count;

        public RChanHub(EstadisticasService estadisticasService)
        {
            this.estadisticasService = estadisticasService;
        }

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

        [AllowAnonymous]
        public async Task SubscribirARozed()
        {
           await Groups.AddToGroupAsync(Context.ConnectionId, "rozed");
        }

        public override async Task OnConnectedAsync()
        {
            usuariosConectados.Add(Context.GetHttpContext().Connection.RemoteIpAddress.MapToIPv4().ToString());
            await Clients.All.SendAsync("estadisticasActualizadas", await estadisticasService.GetEstadisticasAsync());
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            usuariosConectados.Remove(Context.GetHttpContext().Connection.RemoteIpAddress.MapToIPv4().ToString());
            await Clients.All.SendAsync("estadisticasActualizadas", await estadisticasService.GetEstadisticasAsync());
            await base.OnDisconnectedAsync(exception);
        }

    }

    public interface IRchanHub
    {
        Task HiloCreado(HiloModel hilo);
        Task HiloComentado(string hiloId, string comentario="");
    }
}