<script>
    import RChanClient from '../RChanClient'
    import { fade, blur, fly } from 'svelte/transition';
    import {Ripple} from 'svelte-mui'
    import RozedSignal from '../RozedSignal';
    import {HubConnectionBuilder} from '@microsoft/signalr'
    import { each } from 'svelte/internal';

    export let notificaciones

    $: totalNotificaciones = notificaciones.map(n => n.conteo).reduce((c, n) => c+=n, 0)
    let mostrar =  false
    let nuevasNotificaciones = []

    async function limpiar() {
        try {
            await RChanClient.limpiarNotificaciones()
        } catch (error) {
            console.log(error);
            return
        }
        notificaciones = []
        mostrar = false
    }

    let connection = new HubConnectionBuilder().withUrl("/hub").build();
    connection.on("NuevaNotificacion", noti => {
        nuevasNotificaciones = [noti, ...nuevasNotificaciones]
        setTimeout(() => {
            nuevasNotificaciones.pop()
            nuevasNotificaciones = nuevasNotificaciones
        }, 5000)
        let yaExisteUnaNotiDeEseTipo = false
        let notiVieja = null
        for (const n of notificaciones) {
            if(n.hiloId == noti.hiloId && n.tipo == noti.tipo  && n.tipo == 0)
            {
                n.conteo++;
                yaExisteUnaNotiDeEseTipo = true
                notiVieja = n
            }
            else if(n.hiloId == noti.hiloId && n.comentarioId == noti.comentarioId && n.tipo == noti.tipo  && n.tipo == 1)
            {
                n.conteo++;
                yaExisteUnaNotiDeEseTipo = true
                notiVieja = n
            }
        }
        if(!yaExisteUnaNotiDeEseTipo) {
            noti.conteo = 1
            notificaciones = [noti, ...notificaciones]
        }else {
            notificaciones = notificaciones.filter(n => n != notiVieja)
            notificaciones = [notiVieja, ...notificaciones]
        }
    })
    connection.start().then(() => {
        console.log("Conectadito");
        return connection.invoke("SubscribirseAHilo", hilo.id)
        
    }).catch(console.error)

</script>
<span class="nav-boton drop-btn" style="display: flex; align-items: center; postition:relative; margin-right:6px">
    <span class="fe fe-bell" style="padding:16px;border-radius:4px" 
        on:click={() => mostrar = !mostrar && totalNotificaciones != 0}
    >
    {#if notificaciones.length != 0}
        <div class="noti-cont" style="position: absolute;">
            <span>{totalNotificaciones}</span>
        </div>
    {/if}
    <Ripple/>
    </span>
    {#if mostrar}
        <ul transition:fly={{x: -50, duration:150}} class="notis panel drop-menu abs lista-nav menu1"
            on:mouseleave={() => mostrar = false}
        >
            {#each notificaciones as n}
                <a href="/Notificacion/{n.id}?hiloId={n.hiloId}&comentarioId={n.comentarioId}">
                    <li class="noti">
                        <img src="{n.hiloImagen}" alt="">
                        {#if n.tipo == 0}
                            <span>{n.conteo} Nuevos Comentarios en : {n.hiloTitulo}</span>
                        {:else}
                            <span>{n.conteo} Respondieron a tu comentario : {n.comentarioId}</span>
                        {/if}
                    </li>
                </a>
            {/each}
            <li class="noti" style="justify-content: center;"
                on:click={limpiar}
            >Limpiar todas</li>
        </ul>
    {/if}
</span>

<ul class="nuevas-notificaciones notis panel drop-menu abs lista-nav menu1">
    {#each nuevasNotificaciones as n}
        <div out:fly|local={{x: -150, duration:250}} >

            <a  href="/Notificacion/{n.id}?hiloId={n.hiloId}&comentarioId={n.comentarioId}">
                <li  class="noti">
                    <img src="{n.hiloImagen}" alt="">
                    <div class="">
                        <h3>{n.hiloTitulo}</h3>
    
                        {#if n.tipo == 0}
                            <span style="color: var(--color5)"> Han comentado </span>
                        {:else}
                            <span style="color: var(--color5)"> Han respondido tu comentario</span>
                        {/if}
                        <span>{@html n.contenido}</span>
                    </div>
                </li>
            </a>
        </div>
    {/each}
</ul>

<style>

.nuevas-notificaciones {
    position: fixed;
    bottom: 16px;
    top: auto;
    left: 16px;
    min-width: 320px;
    width: fit-content;
}
.nuevas-notificaciones li {
    max-width: 400px;
    max-height: 100px;
    overflow: hidden;
    border-top: 1px solid var(--color5);
    border-radius: 4px;
    margin-bottom: 8px;
}
.nuevas-notificaciones li h3{
    max-height: 30px;

}
</style>