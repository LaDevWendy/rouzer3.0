<script>
    import RChanClient from '../RChanClient'
    import { fade, blur, fly } from 'svelte/transition';
    import {Ripple} from 'svelte-mui'

    export let notificaciones

    $: totalNotificaciones = notificaciones.map(n => n.conteo).reduce((c, n) => c+=n, 0)
    let mostrar =  false

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

</script>
<span class="nav-boton drop-btn" style="display: flex; align-items: center; postition:relative; margin-right:6px">
    <span class="fe fe-bell" style="padding: 12px;" 
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

<style>

</style>