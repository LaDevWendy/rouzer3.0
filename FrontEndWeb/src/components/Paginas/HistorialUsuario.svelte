<script>
    import BarraModeracion from "../Moderacion/BarraModeracion.svelte";
    import { Button } from "svelte-mui";
    import ComentarioMod from "../Moderacion/ComentarioMod.svelte";
    import HiloPreviewMod from "../Moderacion/HiloPreviewMod.svelte";
    import { MotivoDenuncia } from "../../enums";
    //import { formatearTiempo, formatearTimeSpan } from "../../helper";
    import BanPreview from "../Moderacion/BanPreview.svelte";
    import { HiloEstado } from "../../enums";
    import { ComentarioEstado } from "../../enums";
    import Signal from "../../signal";
    import globalStore from "../../globalStore";
    import ErrorValidacion from "../ErrorValidacion.svelte";
    import RChanClient from "../../RChanClient";
    import { Textfield } from "svelte-mui";
    import RouzCoins from "../Premium/RouzCoins.svelte";

    let innerWidth = window.innerWidth;
    let current = 3;

    let hilos = window.model.hilos;
    let comentarios = window.model.comentarios;
    let usuario = window.model.usuario;
    let baneos = window.model.baneos;
    // let denuncias = window.model.denuncias

    const motivo = Object.keys(MotivoDenuncia);

    comentarios = comentarios.map((c) => {
        c.respuestas = [];
        return c;
    });

    Signal.subscribirAModeracion();
    Signal.subscribirAHome();
    Signal.coneccion.on("NuevoComentarioMod", (comentario) => {
        if (comentario.usuarioId == usuario.id) {
            comentario.respuestas = [];
            comentarios.unshift(comentario);
            comentarios = comentarios;
        }
    });
    Signal.coneccion.on("HiloCreadoMod", (hilo) => {
        console.log(hilo);
        if (hilo.usuarioId == usuario.id) {
            hilos = [hilo, ...hilos];
        }
    });
    Signal.coneccion.on("categoriaCambiada", (data) => {
        let hilo = hilos.filter((h) => h.id == data.hiloId);
        if (hilo.length != 0) {
            hilo[0].categoriaId = data.categoriaId;
            hilos = hilos;
        }
    });
    Signal.coneccion.on("HilosEliminados", (ids) => {
        let hs = hilos.filter((h) => ids.includes(h.id));
        if (hs.length != 0) {
            hs.map((h) => (h.estado = HiloEstado.eliminado));
            hilos = hilos;
        }
    });
    Signal.coneccion.on("ComentariosEliminados", (ids) => {
        let cs = comentarios.filter((c) => ids.includes(c.id));
        if (cs.length != 0) {
            cs.map((c) => {
                c.estado = ComentarioEstado.eliminado;
            });
            comentarios = comentarios;
        }
    });

    let exito = false;
    let respuesta = null;
    let error = null;

    async function eliminarToken() {
        try {
            error = null;
            respuesta = (await RChanClient.eliminarToken(usuario.id)).data;
            exito = true;
        } catch (e) {
            exito = false;
            error = e.response.data;
        }
    }

    function onDblClick(e) {
        if (!$globalStore.usuario.esAdmin) return;
        e.preventDefault();
        window.location = `/Moderacion/HistorialDeUsuario2/${usuario.id}`;
    }

    let touch = false;
    function onTouchStart(e) {
        if (!$globalStore.usuario.esAdmin) return;
        e.preventDefault();
        if (touch) {
            window.location = `/Moderacion/HistorialDeUsuario2/${usuario.id}`;
        } else {
            touch = true;
            setTimeout(() => (touch = false), 500);
        }
    }

    let password;
</script>

<svelte:window bind:innerWidth />

<BarraModeracion />
<main>
    <div class="panel" style="display: flex">
        <div
            class="panel"
            style="background:var(--color6) !important;color:black; padding:8px 16px;"
        >
            <h1 on:dblclick={onDblClick} on:touchstart={onTouchStart}>
                {usuario.userName}
            </h1>
        </div>
        {#if usuario.esPremium}
            <div class="panel">
                <h1><RouzCoins cantidad="" /></h1>
            </div>
        {/if}
    </div>
    <div class="panel">
        <p>Id: {usuario.id}</p>
        <p>Registro: {usuario.creacion}</p>
        <p>Numero de rozs(en db): {usuario.rozs}</p>
        <p>Numero de comentarios(en db): {usuario.comentarios}</p>
    </div>
    {#if $globalStore.usuario.esAdmin}
        <ErrorValidacion {error} />
        {#if exito}
            <p class="exito">{respuesta.mensaje}</p>
        {/if}
        {#if hilos.length == 0 && comentarios.length == 0}
            <Button raised color="var(--color5)" on:click={eliminarToken}
                >Eliminar token</Button
            >
        {/if}
    {/if}
    {#if innerWidth < 956}
        <div id="botones" class="tab">
            {#if $globalStore.usuario.esMod}
                <button
                    id="tab1"
                    class="boton {current === 1 ? 'active' : ''}"
                    on:click={() => (current = 1)}
                >
                    Últimos hilos
                </button>

                <button
                    id="tab2"
                    class="boton {current === 2 ? 'active' : ''}"
                    on:click={() => (current = 2)}
                >
                    Últimos comentarios
                </button>
            {/if}
            <button
                id="tab3"
                class="boton {current === 3 ? 'active' : ''}"
                on:click={() => (current = 3)}
            >
                Baneos
            </button>
        </div>
    {/if}
    <div class="historial" style="min-width: 33%;">
        {#if (innerWidth > 956 || current === 1) && $globalStore.usuario.esMod}
            <ul
                style="width:33%; min-width: 33%;"
                class={innerWidth <= 956 ? "resize" : ""}
            >
                <h3 style="height:40px">Ultimos hilos</h3>
                {#each hilos as h (h.id)}
                    <HiloPreviewMod hilo={h} />
                {/each}
            </ul>
        {/if}
        {#if (innerWidth > 956 || current === 2) && $globalStore.usuario.esMod}
            <ul
                style="width:33%; min-width: 33%;"
                class={innerWidth <= 956 ? "resize" : ""}
            >
                <h3 style="height:40px">Ultimos comentarios</h3>
                {#each comentarios as c (c.id)}
                    <ComentarioMod comentario={c} />
                {/each}
            </ul>
        {/if}
        {#if innerWidth > 956 || current === 3}
            <ul
                style="width:33%; min-width: 33%;"
                class={innerWidth <= 956 ? "resize" : ""}
            >
                <h3 style="height:40px">Baneos</h3>
                {#each baneos as ban}
                    <li style="margin-bottom:4px">
                        <BanPreview {ban} />
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</main>

<style>
    h1 {
        text-align: center;
    }
    main {
        display: flex;
        gap: 10px;
        flex-direction: column;
        margin: auto;
        justify-content: center;
        align-items: center;
    }
    .historial {
        display: flex;
        gap: 10px;
        margin: auto;
        justify-content: center;
        width: 100%;
        max-width: 1800px;
    }
    ul,
    .panel {
        background: var(--color4);
        padding: 10px;
    }
    ul :global(.hilo) {
        width: 100%;
        height: 100px !important;
    }
    ul :global(.hilo img) {
        height: fit-content;
    }

    .panel {
        width: max-content;
    }

    #botones {
        display: flex;
        flex-direction: row;
        width: 100%;
        max-width: 480px;
        justify-content: space-around;
    }
    .resize {
        width: 100% !important;
        max-width: 574px;
    }
    .tab {
        overflow: hidden;
        border: 1px solid #354e67;
        background-color: #17212b;
    }
    .tab button {
        background-color: inherit;
        float: left;
        border: none;
        outline: none;
        cursor: pointer;
        padding: 14px 16px;
        transition: 0.3s;
        color: white;
        width: 33%;
    }
    .tab button:hover {
        background-color: #2b333b;
    }
    .tab button.active {
        background-color: #322029;
    }
</style>
