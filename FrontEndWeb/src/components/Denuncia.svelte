<script>
    import HiloCuerpo from "./Hilos/HiloCuerpo.svelte"
    import HiloPreview from "./Hilos/HiloPreview.svelte"
    import {Button} from "svelte-mui"
    import Tiempo from "./Tiempo.svelte"
    import Comentario from "./Comentarios/Comentario.svelte"
    import RChanClient from "../RChanClient";
    import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher()

    export let denuncia
    let {hilo, comentario, usuario}  = denuncia
    $: rechazada = denuncia.estado == 1

    hilo.cantidadComentarios = ""

    let mostrarVistaPrevia = false

    const motivos = [ 'CategoriaIncorrecta',
        'Spam',
        'Avatarfageo',
        'Doxxeo',
        'Contenido ilegal',
        'Maltrato animal']

    async function rechazar() {
        try {
            let res = await RChanClient.rechazarDenuncia(denuncia.id)
            dispatch("rechazar", denuncia.id)
            estado = 1;
            
        } catch (error) {
            
        }
    }
</script>

<div class="denuncia" class:rechazada>
    <div class="header">
        <span style="background:var(--color2); padding:2px; border-radius: 4px">
            <Tiempo date={denuncia.creacion}/>
        </span>
        <a class="userlink" href="/Moderacion/HistorialDeUsuario/{usuario?.id}">{usuario?.userName || "anonimo"}</a>
         denuncio a 
         {#if denuncia.tipo == 0}
         <a class="userlink" href="/Moderacion/HistorialDeUsuario/{hilo.usuario.id}">{hilo.usuario.userName}</a>
         {:else}
         <a class="userlink" href="/Moderacion/HistorialDeUsuario/{comentario.usuario.id}">{comentario.usuario.userName}</a>
         {/if}
          por {motivos[denuncia.motivo]} {denuncia.aclaracion? `(${denuncia.aclaracion})`:''}
    </div>

    <div class="body">
        <Button on:click={() => mostrarVistaPrevia = !mostrarVistaPrevia}>Ver Hilo</Button>
        <a href="/Hilo/{hilo.id}#{comentario?.id}">
            <Button >Ir</Button>
        </a>
        <Button on:click={rechazar}>Rechazar</Button>
        {#if denuncia.tipo == 0}
            <HiloPreview {hilo}/>
        {:else}
            <Comentario comentario={comentario}/>
        {/if}
        {#if mostrarVistaPrevia}
            <div class="vista-previa" on:mouseleave={() => mostrarVistaPrevia = false}>
                <HiloCuerpo {hilo}/>
            </div>
        {/if}
    </div>
</div>

<style>
    .header {
        padding: 8px;
    }
    .denuncia {
        position: relative;
        background: rgba(18, 18, 116, 0.315);
        margin-bottom: 16px;
        border-radius:  4px;
    }
    .vista-previa {
        background: var(--color2);
        position: absolute;
        z-index: 2;
        top: 30px;
        right: 10px
    }

    .userlink {
        background: var(--color6);
        color:black;
        padding:  2px 8px;
        border-radius: 4px;
    }
    .userlink:hover {
        text-decoration: underline;
        filter: brightness(1.4);
    }

    .rechazada {
        background: grey;
    }
</style>