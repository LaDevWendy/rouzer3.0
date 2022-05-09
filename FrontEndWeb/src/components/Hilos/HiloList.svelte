<script>
    import HiloPreview from "./HiloPreview.svelte";
    import globalStore from "../../globalStore";
    import { Ripple } from "svelte-mui/";
    import { fly } from "svelte/transition";
    import InfiniteLoading from "svelte-infinite-loading";
    import { HubConnectionBuilder } from "@microsoft/signalr";
    import RChanClient from "../../RChanClient";
    import Signal from "../../signal";
    import { localStore } from "../../localStore";
    import ajustesConfigStore from "../Dialogos/ajustesConfigStore";
    // import AccionesRapidas from '../Moderacion/AccionesRapidas.svelte';

    export let hiloList;
    export let noCargarNuevos = false;

    hiloList.categoriasActivas == hiloList.categoriasActivas ||
        $ajustesConfigStore.palabrasHideadasglobalStore.categoriasActivas.includes(
            hilo.categoriaId
        ); //??quitado

    $: hiloList.hilos = hiloList.hilos.filter((h) => !estaOculto(h));
    // let palabrasHideadasString = localStore("palabrasHideadas", "")
    // $:if($pahi) {hiloList.hilos = hiloList.hilos.filter(h => !estaOculto(h))}

    let nuevoshilos = [];

    noCargarNuevos = hiloList.hilos.every((h) => h.historico);

    Signal.subscribirAHome();
    Signal.coneccion.on("HiloCreado", onHiloCreado);
    Signal.coneccion.on("HiloComentado", onHiloComentado);
    Signal.coneccion.on("HilosEliminados", (ids) => {
        hiloList.hilos = hiloList.hilos.filter((h) => !ids.includes(h.id));
        nuevoshilos = nuevoshilos.filter((h) => !ids.includes(h.id));
    });
    Signal.coneccion.on("categoriaCambiada", (data) => {
        let hilo = hiloList.hilos.filter((h) => h.id == data.hiloId);
        if (hilo.length != 0) {
            hilo[0].categoriaId = data.categoriaId;
            hiloList.hilos = hiloList.hilos;
        }
        hilo = nuevoshilos.filter((h) => h.id == data.hiloId);
        if (hilo.length != 0) {
            hilo[0].categoriaId = data.categoriaId;
            nuevoshilos = nuevoshilos;
        }
        if (!hiloList.categoriasActivas.includes(data.categoriaId)) {
            hiloList.hilos = hiloList.hilos.filter((h) => h.id != data.hiloId);
            nuevoshilos = nuevoshilos.filter((h) => h.id != data.hiloId);
        }
    });

    function onHiloCreado(hilo) {
        if (noCargarNuevos) return;
        if (hiloList.tendencias) return;
        if (hiloList.serios && !hilo.serio) return;
        if (hiloList.categoriasActivas.includes(hilo.categoriaId)) {
            nuevoshilos = [hilo, ...nuevoshilos];
        }
    }
    function onHiloComentado(id, comentario) {
        let hiloComentado = [...hiloList.hilos, ...nuevoshilos].filter(
            (h) => h.id == id
        );
        if (hiloComentado.length != 0) {
            hiloComentado[0].cantidadComentarios += 1;
        }
        hiloList = hiloList;
    }

    function cargarNuevos() {
        let stickies = [];

        while (hiloList.hilos.length != 0 && hiloList.hilos[0].sticky != 0) {
            stickies.push(hiloList.hilos.shift());
        }

        hiloList.hilos = [...stickies, ...nuevoshilos, ...hiloList.hilos];

        nuevoshilos = [];

        window.document.body.scrollTop = 0;
        window.document.documentElement.scrollTop = 0;
    }

    async function cargarViejos({ detail: { loaded, complete } }) {
        if (hiloList.hilos.length == 0) complete();
        try {
            let { data } = await RChanClient.cargarMasHilos(
                hiloList.hilos[hiloList.hilos.length - 1].bump,
                hiloList.hilos[hiloList.hilos.length - 1].creacion,
                hiloList.hilos[hiloList.hilos.length - 1].trendIndex,
                hiloList.categoriasActivas,
                hiloList.serios,
                hiloList.nuevos,
                hiloList.tendencias,
                hiloList.categoria
            );
            hiloList.hilos = [...hiloList.hilos, ...data];
            if (data.length == 0) complete();
            loaded();
        } catch {
            complete();
        }
    }

    if (!$ajustesConfigStore.palabrasHideadas)
        $ajustesConfigStore.palabrasHideadas = "";
    let palabrasHideadas = $ajustesConfigStore.palabrasHideadas
        .toLowerCase()
        .split(" ")
        .map((p) => p.trim())
        .map((p) => p.replace(/\_/g, " "))
        .filter((p) => p);

    function estaOculto(hilo) {
        let titulo = hilo.titulo.toLowerCase();
        for (const palabra of palabrasHideadas) {
            if (titulo.includes(palabra)) return true;
        }
        return false;
    }

    let tienaMas = true;
    let accionesRapidas = null;

    function hiloCliqueado(params) {}
</script>

<!-- <AccionesRapidas bind:this={accionesRapidas}/> -->
<ul class="hilo-list">
    {#if nuevoshilos.length > 0}
        <div
            class="cargar-nuevos-hilos"
            on:click={cargarNuevos}
            transition:fly|local={{ x: 100 }}
        >
            <icon class="fe fe-rotate-cw" style="margin-right: 8px;" />
            Cargar {nuevoshilos.length}
            {nuevoshilos.length == 1 ? "roz nuevo" : "rozes nuevos"}
            <Ripple />
        </div>
    {/if}
    {#each hiloList.hilos as hilo (hilo.id)}
        <HiloPreview {hilo} on:click={hiloCliqueado} />
    {/each}
</ul>
<InfiniteLoading on:infinite={cargarViejos} distance={600}>
    <div style="text-align:center" slot="noMore">
        No hay mas hilos padre, recargue la pagina
    </div>
    <div style="text-align:center" slot="noResults" />
</InfiniteLoading>

<style>
    .cargar-nuevos-hilos {
        position: fixed;
        align-items: center;
        z-index: 9;
        bottom: 16px;
        right: 16px;
        padding: 0 16px;
        display: flex;
        height: 44px;
        border-radius: 4px;
    }
</style>
