<script>
    import Comentario from "../Comentarios/Comentario.svelte";
    import { fly } from "svelte/transition";
    import Denuncia from "../Denuncia.svelte";
    import HiloPreview from "../Hilos/HiloPreview.svelte";
    import BarraModeracion from "../Moderacion/BarraModeracion.svelte";
    import ComentarioMod from "../Moderacion/ComentarioMod.svelte";
    import HiloPreviewMod from "../Moderacion/HiloPreviewMod.svelte";
    import Sigal from "../../signal";

    let innerWidth = window.innerWidth;
    let current = 2;

    let hilos = window.model.hilos;
    let comentarios = window.model.comentarios;
    let denuncias = window.model.denuncias;
    let comentariosMedia = window.model.medias;

    comentarios = comentarios.map((c) => {
        c.respuestas = [];
        return c;
    });

    Sigal.subscribirAModeracion();
    Sigal.coneccion.on("NuevoComentarioMod", (comentario) => {
        comentario.respuestas = [];
        comentarios.unshift(comentario);
        comentarios.pop();
        comentarios = comentarios;
    });
    Sigal.coneccion.on("HiloCreadoMod", (hilo) => {
        hilos.pop();
        hilos = [hilo, ...hilos];
    });
</script>

<svelte:window bind:innerWidth />

<main>
    <BarraModeracion />
    <div class="ultimos-medias">
        <ul>
            {#each comentariosMedia as c}
                <li>
                    <a href="/Hilo/{c.hiloId}#{c.id}">
                        <img src={c.media.vistaPreviaCuadrado} alt="" />
                    </a>
                </li>
            {/each}
        </ul>
    </div>
    <div id="botones" class="tab {innerWidth < 956 ? '' : 'oculta'}">
        <button
            id="tab1"
            class="boton {current === 1 ? 'active' : ''}"
            on:click={() => (current = 1)}
        >
            Denuncias
        </button>
        <button
            id="tab2"
            class="boton {current === 2 ? 'active' : ''}"
            on:click={() => (current = 2)}
        >
            Hilos
        </button>
        <button
            id="tab3"
            class="boton {current === 3 ? 'active' : ''}"
            on:click={() => (current = 3)}
        >
            Comentarios
        </button>
    </div>
    <div class="seccion2" style="min-width: 33%">
        <ul
            style="width:33%; background:#711c08; font-size: 0.7em; min-width:33%"
            class="{innerWidth > 956 || current === 1
                ? ''
                : 'oculta'} {innerWidth <= 956 ? 'resize' : ''}"
        >
            <h3 style="height:40px">Ultimas denuncias</h3>
            {#each denuncias as d}
                <Denuncia denuncia={d} />
            {/each}
        </ul>
        <ul
            style="width:33%; min-width:33%"
            class="{innerWidth > 956 || current === 2
                ? ''
                : 'oculta resize'} {innerWidth <= 956 ? 'resize' : ''}"
        >
            <h3 style="height:40px">Ultimos hilos</h3>
            {#each hilos as h (h.id)}
                <HiloPreviewMod hilo={h} />
            {/each}
        </ul>
        <ul
            style="width:33%; min-width:33%"
            class="{innerWidth > 956 || current === 3
                ? ''
                : 'oculta resize'} {innerWidth <= 956 ? 'resize' : ''}"
        >
            <h3 style="height:40px">Ultimos comentarios</h3>
            {#each comentarios as c}
                <li transition:fly|local={{ y: -50, duration: 250 }}>
                    <a href="/Hilo/{c.hiloId}#{c.id}"
                        ><ComentarioMod comentario={c} /></a
                    >
                </li>
            {/each}
        </ul>
    </div>
</main>

<style>
    main {
        display: flex;
        gap: 10px;
        margin: auto;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .seccion2 {
        width: 100%;
        max-width: 1800px;
        display: flex;
        gap: 10px;
        margin: auto;
        justify-content: center;
    }
    .seccion2 ul {
        max-width: 500px;
        background: var(--color2);
        padding: 10px;
    }

    .ultimos-medias ul {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }
    .ultimos-medias img {
        width: 64px;
        height: 64px;
        border-radius: 4px;
    }

    #botones {
        display: flex;
        flex-direction: row;
        width: 100%;
        max-width: 480px;
        justify-content: space-around;
    }
    .oculta {
        display: none !important;
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
    }
    .tab button:hover {
        background-color: #2b333b;
    }
    .tab button.active {
        background-color: #322029;
    }
</style>
