<script>
    import Tiempo from './Tiempo.svelte'
    import RChanClient from '../RChanClient'
    export let hilo
    export let acciones;

    async function seguir() {
        await RChanClient.agregar("seguidos", hilo.id)
        acciones.seguido = !acciones.seguido
    }
    async function ocultar() {
        await RChanClient.agregar("ocultos", hilo.id)
        acciones.hideado = !acciones.hideado
    }
    async function favoritear() {
        await RChanClient.agregar("favoritos", hilo.id)
        acciones.favorito = !acciones.favorito
    }
</script>

<div class="panel acciones">
    <!-- <div class="debug" style="bottom: 200px;height: fit-content;"> {"usuarioId":null,"hiloId":null,"seguido":false,"favorito":false,"hideado":false,"id":null,"creacion":"2020-10-15T00:59:47.7667-03:00"}</div> -->
    <span class="{acciones.favorito? " naranja":"fantasma"}" r-accion="favoritos" r-id="{hilo.id}"
        on:click={favoritear}> <i
            class="fe fe-star"></i>Favorito</span>

    <span class="{acciones.seguido? " naranja":"fantasma"}" r-accion="seguidos"
        on:click={seguir}>
        <i class="fe fe-eye" />Seguido</span>

    <span class="{acciones.hideado? " naranja":"fantasma"}" r-accion="ocultos" r-id={hilo.id}
        on:click={ocultar}>
        <i class="fe fe-eye-off" />Oculto</span>

    <span> <i class="fe fe-flag" />Denunciar</span>

    <span>
        <Tiempo date={hilo.creacion} /></span>
</div>