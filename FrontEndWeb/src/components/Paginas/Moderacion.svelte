<script>
    import Comentario from "../Comentarios/Comentario.svelte";
    import { fly } from "svelte/transition";
    import Denuncia from "../Denuncia.svelte";
    import HiloPreview from "../Hilos/HiloPreview.svelte";
    import BarraModeracion from "../Moderacion/BarraModeracion.svelte";
    import ComentarioMod from "../Moderacion/ComentarioMod.svelte";
    import HiloPreviewMod from "../Moderacion/HiloPreviewMod.svelte";
    import Sigal from "../../signal";
    import { HiloEstado } from "../../enums";
    import { EstadoDenuncia } from "../../enums";
    import { ComentarioEstado } from "../../enums";

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
    Sigal.subscribirAHome();
    Sigal.coneccion.on("NuevoComentarioMod", (comentario) => {
        comentario.respuestas = [];
        comentarios.unshift(comentario);
        comentarios.pop();
        comentarios = comentarios;
        if (comentario.media) {
            comentariosMedia.unshift(comentario);
            comentariosMedia.pop();
            comentariosMedia = comentariosMedia;
        }
    });
    Sigal.coneccion.on("HiloCreadoMod", (hilo) => {
        hilos.pop();
        hilos = [hilo, ...hilos];
    });
    Sigal.coneccion.on("categoriaCambiada", (data) => {
        let hilo = hilos.filter((h) => h.id == data.hiloId);
        if (hilo.length != 0) {
            hilo[0].categoriaId = data.categoriaId;
            hilos = hilos;
        }
    });
    Sigal.coneccion.on("HiloComentado", (id, comentario) => {
        let hiloComentado = hilos.filter((h) => h.id == id);
        if (hiloComentado.length != 0) {
            hiloComentado[0].cantidadComentarios += 1;
        }
        hilos = hilos;
    });
    Sigal.coneccion.on("HilosEliminados", (ids) => {
        let hs = hilos.filter((h) => ids.includes(h.id));
        if (hs.length != 0) {
            hs.map((h) => (h.estado = HiloEstado.eliminado));
            hilos = hilos;
        }
    });
    Sigal.coneccion.on("nuevaDenuncia", (denuncia) => {
        denuncias = [denuncia, ...denuncias];
    });
    Sigal.coneccion.on("denunciasRechazadas", (ids) => {
        if (ids.length == 0) return;
        denuncias = denuncias.map((d) => {
            if (ids.includes(d.id)) d.estado = EstadoDenuncia.Rechazada;
            return d;
        });
    });
    Sigal.coneccion.on("denunciasAceptadas", (ids) => {
        if (ids.length == 0) return;
        denuncias = denuncias.map((d) => {
            if (ids.includes(d.id)) d.estado = EstadoDenuncia.Aceptada;
            return d;
        });
    });
    Sigal.coneccion.on("ComentariosEliminados", (ids) => {
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

<main>
    <BarraModeracion />
    <div class="ultimos-medias">
        <ul>
            {#each comentariosMedia as c (c.id)}
                <li>
                    <a href="/Hilo/{c.hiloId}#{c.id}">
                        <img src={c.media.vistaPreviaCuadrado} alt="" />
                    </a>
                </li>
            {/each}
        </ul>
    </div>
    {#if innerWidth < 956}
        <div id="botones" class="tab">
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
    {/if}
    <div class="seccion2" style="min-width: 33%">
        {#if innerWidth > 956 || current === 1}
            <ul
                style="width:33%; background:#711c08; font-size: 0.7em; min-width:33%"
                class={innerWidth <= 956 ? "resize" : ""}
            >
                <h3 style="height:40px">Ultimas denuncias</h3>
                {#each denuncias as d (d.id)}
                    <Denuncia denuncia={d} />
                {/each}
            </ul>
        {/if}
        {#if innerWidth > 956 || current === 2}
            <ul
                style="width:33%; min-width:33%"
                class={innerWidth <= 956 ? "resize" : ""}
            >
                <h3 style="height:40px">Ultimos hilos</h3>
                {#each hilos as h (h.id)}
                    <HiloPreviewMod hilo={h} />
                {/each}
            </ul>
        {/if}
        {#if innerWidth > 956 || current === 3}
            <ul
                style="width:33%; min-width:33%"
                class={innerWidth <= 956 ? "resize" : ""}
            >
                <h3 style="height:40px">Ultimos comentarios</h3>
                {#each comentarios as c (c.id)}
                    <li transition:fly|local={{ y: -50, duration: 250 }}>
                        <a href="/Hilo/{c.hiloId}#{c.id}"
                            ><ComentarioMod comentario={c} /></a
                        >
                    </li>
                {/each}
            </ul>
        {/if}
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
