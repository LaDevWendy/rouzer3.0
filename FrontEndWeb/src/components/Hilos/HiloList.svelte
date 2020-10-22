<script>
    import HiloPreview from './HiloPreview.svelte'
    import globalStore from '../../globalStore'
    import {Ripple} from 'svelte-mui/'
    import {fly} from 'svelte/transition'
    import {HubConnectionBuilder} from '@microsoft/signalr'
    export let hiloList

    let nuevoshilos = []
    let connection = new HubConnectionBuilder().withUrl("/hub").build();

    connection.on("HiloCreado", onHiloCreado)
    connection.on("HiloComentado", onHiloComentado)

    connection.start().then(() => {
        console.log("Conectado");
        return connection.invoke("SubscribirAHome")
        
    }).catch(console.error)

    // Test destello
    // setInterval(() => {
    //     hiloList.hilos[2].cantidadComentarios += 1
    // }, 4000);
    

    function onHiloCreado(hilo) {
        if($globalStore.categoriasActivas.includes(hilo.categoriaId)){
            nuevoshilos = [hilo, ...nuevoshilos]
        }
    }
    function onHiloComentado(id, comentario) {
        let hiloComentado = hiloList.hilos.filter(h => h.id == id)
        if(hiloComentado.length != 0) {
            hiloComentado[0].cantidadComentarios += 1
        }
        hiloList = hiloList
    }

    function cargarNuevos() {
        hiloList.hilos = [...nuevoshilos,...hiloList.hilos]
        window.document.body.scrollTop = 0
        window.document.documentElement.scrollTop = 0
        nuevoshilos = []
    }


</script>

<ul class="hilo-list">
    {#if nuevoshilos.length > 0}
        <div class="cargar-nuevos-hilos" on:click={cargarNuevos} transition:fly={{x:100}}>
            <icon class="fe fe-rotate-cw"  style="margin-right: 8px;"/> 
            Cargar {nuevoshilos.length} {nuevoshilos.length==1? 'hilo nuevo':'hilos nuevos'}
            <Ripple/>
        </div>
    {/if}
    {#each hiloList.hilos as hilo (hilo.id)}
        <HiloPreview bind:hilo={hilo} />
    {/each}
</ul>