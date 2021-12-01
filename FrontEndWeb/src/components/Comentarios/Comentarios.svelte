<script>
    import { fly } from "svelte/transition";
    import { Button } from "svelte-mui";
    import Comentario from "./Comentario.svelte";
    import Formulario from "./Formulario.svelte";
    import globalStore from "../../globalStore";
    import DialogoReporte from "../Dialogos/DialogoReporte.svelte";
    import Signal from "../../signal";
    import CarpetaMedia from "./CarpetaMedia.svelte";
    import { onMount, tick } from "svelte";
    import PilaRespuestas from "./PilaRespuestas.svelte";
    import config, { configStore } from "../../config";
    import ajustesConfigStore from "../Dialogos/ajustesConfigStore";
    import Spinner from "../Spinner.svelte";
    import { localStore } from "../../localStore";
    import comentarioStore from "./comentarioStore";
    import SpamList from "../SpamList.svelte";
    import selectorStore from "../Moderacion/selectorStore";
    import { ComentarioEstado } from "../../enums";
    import InfiniteLoading from "svelte-infinite-loading";
    import Ajustes from "../Dialogos/Ajustes.svelte";

    export let hilo;
    export let comentarios;
    export let spams;

    let modoTelefono = $globalStore.esCelular;
    let nuevosComentarios = [];
    let comentariosStore = localStore("Comentarios", { modoVivo: false });
    let bloque = 100;
    let limite = bloque;

    let infLoadActivo = true;
    function cargarNuevosComentarios() {
        comentarios = [...nuevosComentarios, ...comentarios];
        nuevosComentarios = [];
        comentarios.forEach(agregarComentarioADiccionario);
        comentarios.forEach(cargarRespuestas);
        // Añadir el restag a los comentarios tageados por este comentario
        comentarios = comentarios;
        infLoadActivo = comentarios.length >= limite;
    }

    let diccionarioRespuestas = {};
    let diccionarioComentarios = {};

    function agregarComentarioADiccionario(comentario) {
        diccionarioComentarios[comentario.id] = comentario;
        let tags = comentario.contenido.match(/#([A-Z0-9]{8})/g);
        if (!tags) return;
        let id = comentario.id;
        for (const tag of tags) {
            let otraId = tag.slice(1, 9);
            if (!diccionarioRespuestas[otraId])
                diccionarioRespuestas[otraId] = [];
            diccionarioRespuestas[otraId].push(id);
            diccionarioRespuestas[otraId] = diccionarioRespuestas[otraId];
        }
        diccionarioRespuestas = diccionarioRespuestas;
    }

    function cargarRespuestas(comentario) {
        if (diccionarioRespuestas[comentario.id])
            comentario.respuestas = [...diccionarioRespuestas[comentario.id]];
        else comentario.respuestas = [];
        comentario.respuestas = Array.from(new Set(comentario.respuestas));
    }

    comentarios.forEach(agregarComentarioADiccionario);
    comentarios.forEach(cargarRespuestas);

    function onComentarioCreado(comentario) {
        nuevosComentarios = [comentario, ...nuevosComentarios];
        comentario.respuestas = [];
        if ($comentariosStore.modoVivo) cargarNuevosComentarios();
    }

    Signal.coneccion.on("NuevoComentario", onComentarioCreado);
    Signal.subscribirseAHilo(hilo.id);
    Signal.coneccion.on("ComentariosEliminados", (ids) => {
        if (!$globalStore.usuario.esMod) {
            comentarios = comentarios.filter((c) => !ids.includes(c.id));
            nuevosComentarios = nuevosComentarios.filter(
                (c) => !ids.includes(c.id)
            );
        } else {
            if (ids.length == 0) return;
            comentarios = comentarios.map((c) => {
                if (ids.includes(c.id)) c.estado = ComentarioEstado.eliminado;
                return c;
            });
            nuevosComentarios = nuevosComentarios.map((c) => {
                if (ids.includes(c.id)) c.estado = ComentarioEstado.eliminado;
                return c;
            });
        }
    });

    let resaltando = false;

    function resaltarComentariosDeUsuario(usuarioId) {
        if (!$globalStore.usuario.esMod) return;
        if (resaltando) {
            // comentarios.forEach(c => c.resaltado = false)
            // comentarios = comentarios
            resaltando = false;
            $selectorStore.seleccionados = new Set();
            return;
        }
        comentarios.forEach((c) => {
            if (c.usuarioId == usuarioId) {
                resaltando = true;
                $selectorStore.seleccionados.add(c.id);
                $selectorStore.seleccionados = $selectorStore.seleccionados;
            }
            // c.resaltado = usuarioId == c.usuarioId
        });
        comentarios = comentarios;
    }

    function tagCliqueado(e) {
        if (!diccionarioComentarios[e.detail]) return;
        if (modoTelefono && !$ajustesConfigStore.tagClasico) {
            e.preventDefault();
            historialRespuestas = [[diccionarioComentarios[e.detail]]];
        }
        comentarios.forEach((c) => (c.resaltado = false));
        comentarios = comentarios;
        diccionarioComentarios[e.detail].resaltado = true;
    }

    let comentarioUrl = window.location.hash.replace("#", "");

    async function irAComentario(comentarioId) {
        if (typeof comentarioId != "string") comentarioId = comentarioId.detail;
        if (!diccionarioComentarios[comentarioId]) return;
        let pos = comentarios.findIndex((c) => c.id == comentarioId);
        if (pos - limite > 0) limite = Math.ceil(pos / bloque) * bloque;
        await tick();
        diccionarioComentarios[comentarioId].resaltado = true;
        let comentarioDOM = document.getElementById(comentarioId);
        if (comentarioDOM) comentarioDOM.scrollIntoView({ block: "center" });
    }

    onMount(() => irAComentario(comentarioUrl));
    irAComentario(comentarioUrl);

    let resaltadoIdUnico = false;
    function idUnicoClickeado(e) {
        comentarios.forEach((c) => {
            if (!resaltadoIdUnico) {
                c.resaltado = c.idUnico == e.detail;
            } else {
                c.resaltado = false;
            }
        });
        comentarios = comentarios;
        resaltadoIdUnico = !resaltadoIdUnico;
    }

    let carpetaMedia = false;
    let historialRespuestas = [];

    let cargarComentarios = false;
    onMount(async () => {
        setTimeout(async () => {
            cargarComentarios = true;
            await tick();
            irAComentario(comentarioUrl);
        }, 120);
    });

    let mostrarFormularioFlotante = false;

    let scrollY = 0;
    $: mostrarFormularioFlotante =
        $comentarioStore && comentarioStore.length != 0;

    let spinnerAcciones = false;
    function cargarViejos({ detail: { loaded, complete } }) {
        if (limite > comentarios.length) {
            complete();
        } else {
            setTimeout(() => {
                limite = limite + bloque;
                loaded();
            }, 60);
        }
    }
</script>

<svelte:window bind:scrollY />
<CarpetaMedia
    {comentarios}
    bind:visible={carpetaMedia}
    on:irAComentario={irAComentario}
/>
<div class="comentarios">
    <PilaRespuestas
        {diccionarioComentarios}
        {diccionarioRespuestas}
        historial={historialRespuestas}
    />
    {#if !$configStore.general.modoMessi || $globalStore.usuario.esMod}
        <Formulario {hilo} on:comentarioCreado={cargarNuevosComentarios} />
    {/if}

    <SpamList {spams} />

    <div class="contador-comentarios panel">
        <h3>Comentarios ({comentarios.length})</h3>
        {#if nuevosComentarios.length != 0}
            <div
                class="badge"
                style="    font-size: 18px;height: auto;cursor: pointer;"
            >
                <span on:click={cargarNuevosComentarios}
                    >+ {nuevosComentarios.length}</span
                >
            </div>
        {/if}
        <div class="acciones-comentario">
            <!-- <i on:click={() => carpetaMedia = !carpetaMedia} class="fe fe-folder"></i> -->
            <Button
                on:click={() =>
                    ($comentariosStore.modoVivo = !$comentariosStore.modoVivo)}
                title="Comentarios en vivo (se cargan automaticamente)"
                dense
                icon
            >
                <div
                    class="boton-modo-vivo"
                    style={$comentariosStore.modoVivo
                        ? "background:var(--color5);"
                        : "background:white"}
                />
            </Button>
            {#if comentarios.length > limite}
                <Button
                    on:click={() => {
                        spinnerAcciones = true;
                        setTimeout(() => {
                            limite = bloque;
                            infLoadActivo = false;
                            tick().then(() => {
                                infLoadActivo = comentarios.length >= limite;
                                spinnerAcciones = false;
                            });
                        }, 60);
                    }}
                    title="Limitar a {bloque} comentarios mostrados (evita el lag)"
                    dense
                    icon
                    ><icon class="fe fe-slash" />
                </Button>
            {/if}
            <Button on:click={() => (carpetaMedia = !carpetaMedia)} dense icon
                ><icon class="fe fe-folder" />
            </Button>
            {#if comentarios.length > 0}
                <Button
                    on:click={() => {
                        spinnerAcciones = true;
                        setTimeout(() => {
                            irAComentario(
                                comentarios[comentarios.length - 1].id
                            ).then(() => {
                                spinnerAcciones = false;
                            });
                        }, 60);
                    }}
                    dense
                    icon
                    ><icon class="fe fe-arrow-down" />
                </Button>
                <Spinner cargando={spinnerAcciones} />
            {/if}
        </div>
    </div>
    <Spinner cargando={!cargarComentarios}>
        <div class="lista-comentarios">
            {#each comentarios.slice(0, limite) as comentario (comentario.id)}
                <li transition:fly|local={{ y: -50, duration: 250 }}>
                    <Comentario
                        on:colorClick={(e) =>
                            resaltarComentariosDeUsuario(
                                e.detail.usuarioId || ""
                            )}
                        {hilo}
                        bind:comentario
                        bind:comentariosDic={diccionarioComentarios}
                        respuetasCompactas={modoTelefono}
                        on:tagClickeado={tagCliqueado}
                        on:idUnicoClickeado={idUnicoClickeado}
                        on:irAComentario={irAComentario}
                        on:motrarRespuestas={(e) =>
                            (historialRespuestas = [
                                diccionarioRespuestas[e.detail].map(
                                    (c) => diccionarioComentarios[c]
                                ),
                            ])}
                    />
                </li>
            {/each}
            {#if mostrarFormularioFlotante && !$globalStore.esCelular && scrollY > 300}
                <div
                    class="formulario-flotante"
                    transition:fly|local={{ x: -50, duration: 100 }}
                >
                    <Formulario
                        {hilo}
                        on:comentarioCreado={cargarNuevosComentarios}
                    />
                    <div
                        class="cerrar-comentario-flotante cpt"
                        on:click={() => (mostrarFormularioFlotante = false)}
                    >
                        <span class="fe fe-x" />
                    </div>
                </div>
            {/if}
        </div>
        {#if infLoadActivo}
            <InfiniteLoading on:infinite={cargarViejos} distance="600">
                <div style="text-align:center" slot="noMore" />
                <div style="text-align:center" slot="noResults" />
                <div slot="spinner">
                    <Spinner cargando="true" />
                </div>
            </InfiniteLoading>
        {/if}
        <div class="espacio-vacio" />
    </Spinner>
</div>

<style>
    .espacio-vacio {
        height: 200px;
        /* scroll-snap-align: center; */
    }
    .boton-modo-vivo {
        width: 8px;
        height: 8px;
        border-radius: 8px;
        transition: background 0.2s;
    }
    @media (max-width: 600px) {
        .espacio-vacio {
            height: 24px;
        }
    }
    :global(.loader) {
        margin: 0 auto;
    }

    .formulario-flotante {
        bottom: 20vh;
        width: calc(50vw - 10px);
        right: calc(50vw + 10px);
        position: fixed;
        max-width: 600px;
    }
    .cerrar-comentario-flotante {
        position: absolute;
        top: 1px;
        right: 4px;

        color: var(--color-texto2);
    }
    @media (max-width: 992px) {
        .formulario-flotante {
            width: calc(40vw - 10px);
            right: calc(60vw + 10px);
        }
    }
    @media (max-width: 768px) {
        .formulario-flotante {
            display: none;
        }
    }
</style>
