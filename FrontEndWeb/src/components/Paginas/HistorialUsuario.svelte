<script>
    import BarraModeracion from "../Moderacion/BarraModeracion.svelte";

    import ComentarioMod from "../Moderacion/ComentarioMod.svelte";
    import HiloPreviewMod from "../Moderacion/HiloPreviewMod.svelte";
    import { MotivoDenuncia } from "../../enums";
    import { formatearTiempo, formatearTimeSpan } from "../../helper";
    import BanPreview from "../Moderacion/BanPreview.svelte";
    import { HiloEstado } from "../../enums";
    import { ComentarioEstado } from "../../enums";
    import Signal from "../../signal";

    let innerWidth = window.innerWidth;
    let current = 2;

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
</script>

<svelte:window bind:innerWidth />

<BarraModeracion />
<main>
    <div
        class="panel"
        style="background:var(--color6) !important;color:black; padding:8px 16px;"
    >
        <h1 style>{usuario.userName}</h1>
    </div>
    <div class="panel">
        <p>Id: {usuario.id}</p>
        <p>Registro: {usuario.creacion}</p>
        <p>Numero de rozs(en db): {usuario.rozs}</p>
        <p>Numero de comentarios(en db): {usuario.comentarios}</p>
    </div>
    {#if innerWidth < 956}
        <div id="botones" class="tab">
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
        {#if innerWidth > 956 || current === 1}
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
        {#if innerWidth > 956 || current === 2}
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
