<script>
    import { fly } from "svelte/transition";
    import { Button } from "svelte-mui";
    import Comentario from "./Comentario.svelte";
    import Formulario from "./Formulario.svelte";
    import globalStore from "../../globalStore";
    import Signal from "../../signal";
    import CarpetaMedia from "./CarpetaMedia.svelte";
    import { onMount, tick } from "svelte";
    import PilaRespuestas from "./PilaRespuestas.svelte";
    import { configStore } from "../../config";
    import ajustesConfigStore from "../Dialogos/ajustesConfigStore";
    import Spinner from "../Spinner.svelte";
    import { localStore } from "../../localStore";
    // import comentarioStore from "./comentarioStore";
    import SpamList from "../SpamList.svelte";
    import selectorStore from "../Moderacion/selectorStore";
    import { ComentarioEstado } from "../../enums";
    import InfiniteLoading from "svelte-infinite-loading";
    import NavegadorPaginas from "./NavegadorPaginas.svelte";

    export let hilo;
    export let comentarios;
    export let spams;

    let modoTelefono = $globalStore.esCelular;
    let comentarioModo = $ajustesConfigStore.comentarioModo || "1";
    let tagClasico = $ajustesConfigStore.tagClasico;
    let nuevosComentarios = [];
    let comentariosStore = localStore("Comentarios", { modoVivo: false });

    // Modo 1 y modo 2
    let bloque = 50;
    let limite = bloque;
    let infLoadActivo = comentarioModo == "1";
    let paginaMaxima = Math.ceil(comentarios.length / bloque);
    // ---------------

    let idComentarioPropio = "";
    Signal.coneccion.on("ComentarioPropio", (id) => {
        idComentarioPropio = id;
    });

    let idComentarioDecorado = "";
    Signal.coneccion.on("SoyOp", (id) => {
        idComentarioDecorado = id;
    });

    function cargarNuevosComentarios() {
        comentarios = [...nuevosComentarios, ...comentarios];
        nuevosComentarios.forEach(agregarComentarioADiccionario);
        nuevosComentarios = [];
        comentarios.forEach(cargarRespuestas);
        // Añadir el restag a los comentarios tageados por este comentario
        comentarios = comentarios;
        stickies = stickies;
        if (comentarioModo == "1") {
            infLoadActivo = comentarios.length >= limite;
        }
        if (comentarioModo == "2") {
            paginaMaxima = Math.ceil(comentarios.length / bloque);
        }
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
            diccionarioRespuestas[otraId] = diccionarioRespuestas[
                otraId
            ].filter((id) => diccionarioComentarios[id]);
            /*diccionarioRespuestas[otraId] = diccionarioRespuestas[otraId].sort(
                (c1, c2) =>
                    diccionarioComentarios[c2].creacion.localeCompare(
                        diccionarioComentarios[c1].creacion
                    )
            );*/
        }
        diccionarioComentarios = diccionarioComentarios;
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
    let stickies;
    listarStickies();

    function onComentarioCreado(comentario) {
        if (comentario.id == idComentarioPropio) {
            comentario.propio = true;
        }
        if (comentario.id == idComentarioDecorado) {
            comentario.op = true;
        }
        nuevosComentarios = [comentario, ...nuevosComentarios];
        comentario.respuestas = [];
        if ($comentariosStore.modoVivo) cargarNuevosComentarios();
    }

    Signal.coneccion.on("NuevoComentario", onComentarioCreado);
    Signal.coneccion.on("NuevoSticky", (id, sticky) => {
        diccionarioComentarios[id].sticky = sticky;
        comentarios = comentarios;
        if (sticky) {
            if (!stickies.some((s) => s.id == id)) {
                stickies.unshift(diccionarioComentarios[id]);
                stickies = stickies.sort((c1, c2) => c2.creacion - c1.creacion);
            }
        } else {
            stickies = stickies.filter((s) => s.id != id);
        }
    });

    Signal.subscribirseAHilo(hilo.id);
    Signal.coneccion.on("ComentariosEliminados", (ids) => {
        if (!$globalStore.usuario.esMod) {
            comentarios = comentarios.filter((c) => !ids.includes(c.id));
            nuevosComentarios = nuevosComentarios.filter(
                (c) => !ids.includes(c.id)
            );
            stickies = stickies.filter((s) => !ids.includes(s.id));
            ids.forEach((id) => {
                delete diccionarioComentarios[id];
            });
            diccionarioComentarios = diccionarioComentarios;
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
            stickies = stickies.map((s) => {
                if (ids.includes(s.id)) s.estado = ComentarioEstado.eliminado;
                return s;
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
        if (modoTelefono && !tagClasico) {
            e.preventDefault();
            historialRespuestas = [[diccionarioComentarios[e.detail]]];
        }
        comentarios.forEach((c) => (c.resaltado = false));
        diccionarioComentarios[e.detail].resaltado = true;
        comentarios = comentarios;
    }

    let comentarioUrl = window.location.hash.replace("#", "");
    let paginaActual = 1;
    let pagina = 1;
    let cargarComentarios = false;

    function scrollAComentario(comentarioId) {
        let comentarioDOM = document.getElementById(comentarioId);
        if (comentarioDOM) comentarioDOM.scrollIntoView({ block: "center" });
    }

    async function irAComentario(comentarioId) {
        if (typeof comentarioId != "string") comentarioId = comentarioId.detail;
        if (!diccionarioComentarios[comentarioId]) return;
        diccionarioComentarios[comentarioId].resaltado = true;
        if (comentarioModo == "1") {
            let pos = comentarios.findIndex((c) => c.id == comentarioId);
            if (pos - limite > 0) {
                cargarComentarios = false;
                setTimeout(async () => {
                    cargarComentarios = true;
                    limite = (Math.floor(pos / bloque) + 1) * bloque;
                    await tick();
                    scrollAComentario(comentarioId);
                }, 120);
                return;
            }
        }
        if (comentarioModo == "2") {
            let pos = comentarios.findIndex((c) => c.id == comentarioId);
            let pag = Math.floor(pos / bloque) + 1;
            if (paginaActual != pag) {
                cargarComentarios = false;
                setTimeout(async () => {
                    cargarComentarios = true;
                    paginaActual = pag;
                    await tick();
                    scrollAComentario(comentarioId);
                }, 120);
                return;
            }
        }
        scrollAComentario(comentarioId);
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

    onMount(async () => {
        setTimeout(async () => {
            cargarComentarios = true;
            await tick();
            irAComentario(comentarioUrl);
        }, 120);
    });

    let mostrarFormularioFlotante = false;

    let scrollY = 0;
    export let comentarioStore;
    $: mostrarFormularioFlotante =
        comentarioStore && comentarioStore.length != 0;

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
    export let hide;
    let hide_flag = false;

    function listarStickies() {
        stickies = comentarios.filter((c) => c.sticky);
    }

    function mostrarRespuestas(e) {
        let resp = diccionarioRespuestas[e.detail]
            .map((c) => diccionarioComentarios[c])
            .filter((c) => c != undefined);
        if (resp.length > 0) {
            historialRespuestas = [resp];
        }
    }

    async function cambiarPagina() {
        cargarComentarios = false;
        setTimeout(async () => {
            pagina = Math.max(pagina, 1);
            pagina = Math.min(pagina, paginaMaxima);
            paginaActual = pagina;
            cargarComentarios = true;
            await tick();
            let id = comentarios[(paginaActual - 1) * bloque].id;
            scrollAComentario(id);
        }, 60);
    }

    function tagear(comentarioId) {
        console.log(comentarioId.detail);
        if (typeof comentarioId != "string") comentarioId = comentarioId.detail;
        if (!comentarioStore.includes(`>>${comentarioId}\n`))
            comentarioStore += `>>${comentarioId}\n`;
        let selection = document.getSelection();
        if (selection.anchorNode) {
            let spans = document
                .getElementById(
                    diccionarioComentarios[comentarioId].sticky
                        ? `${comentarioId}-sticky`
                        : comentarioId
                )
                .getElementsByClassName("contenido")[0]
                .getElementsByTagName("span");
            let flag1 = false,
                flag2 = false;
            for (let i = 0; i < spans.length; i++) {
                flag1 = flag1 || spans[i] == selection.anchorNode.parentElement;
                flag2 = flag2 || spans[i] == selection.anchorNode.parentElement;
            }
            let text = selection.toString().trim();
            if (flag1 && flag2 && text != "") comentarioStore += `>${text}\n`;
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
        bind:diccionarioComentarios
        bind:diccionarioRespuestas
        bind:historial={historialRespuestas}
        bind:comentarioStore
    />
    {#if !$configStore.general.modoMessi || $globalStore.usuario.esMod}
        <Formulario
            {hilo}
            bind:comentarioStore
            on:comentarioCreado={cargarNuevosComentarios}
            bind:hide
            bind:hide_flag
        />
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
            {#if comentarioModo == "1" && comentarios.length > bloque}
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
                                comentarios[
                                    comentarioModo == "2"
                                        ? Math.min(
                                              paginaActual * bloque - 1,
                                              comentarios.length - 1
                                          )
                                        : comentarios.length - 1
                                ].id
                            ).then(() => {
                                spinnerAcciones = false;
                            });
                        }, 60);
                    }}
                    dense
                    icon
                    ><icon class="fe fe-arrow-down" />
                </Button>
                <Spinner cargando={comentarioModo == "1" && spinnerAcciones} />
            {/if}
        </div>
    </div>
    <Spinner cargando={!cargarComentarios}>
        <div class="lista-stickies">
            {#each stickies as comentario (comentario.id)}
                <li transition:fly|local={{ y: -50, duration: 250 }}>
                    <Comentario
                        on:colorClick={(e) =>
                            resaltarComentariosDeUsuario(
                                e.detail.usuarioId || ""
                            )}
                        {hilo}
                        esSticky={true}
                        bind:comentario
                        bind:comentariosDic={diccionarioComentarios}
                        respuetasCompactas={modoTelefono}
                        on:tagClickeado={tagCliqueado}
                        on:idUnicoClickeado={idUnicoClickeado}
                        on:irAComentario={irAComentario}
                        on:motrarRespuestas={mostrarRespuestas}
                        on:tagear={tagear}
                    />
                </li>
            {/each}
        </div>
        <div class="lista-comentarios">
            {#if comentarioModo == "0"}
                {#each comentarios as comentario (comentario.id)}
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
                            on:motrarRespuestas={mostrarRespuestas}
                            on:tagear={tagear}
                        />
                    </li>
                {/each}
            {/if}
            {#if comentarioModo == "1"}
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
                            on:motrarRespuestas={mostrarRespuestas}
                            on:tagear={tagear}
                        />
                    </li>
                {/each}
            {/if}
            {#if comentarioModo == "2"}
                {#if comentarios.length > bloque}
                    <NavegadorPaginas
                        bind:pagina
                        bind:paginaActual
                        bind:totalPaginas={paginaMaxima}
                        on:irAlPrimero={() => {
                            pagina = 1;
                            cambiarPagina();
                        }}
                        on:irAlAnterior={() => {
                            pagina = paginaActual - 1;
                            cambiarPagina();
                        }}
                        on:irAlSiguiente={() => {
                            pagina = paginaActual + 1;
                            cambiarPagina();
                        }}
                        on:irAlUltimo={() => {
                            pagina = paginaMaxima;
                            cambiarPagina();
                        }}
                        on:irAlIndicado={() => cambiarPagina()}
                    />
                {/if}
                {#each comentarios.slice((paginaActual - 1) * bloque, paginaActual * bloque) as comentario (comentario.id)}
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
                            on:motrarRespuestas={mostrarRespuestas}
                            on:tagear={tagear}
                        />
                    </li>
                {/each}
                {#if comentarios.length > bloque}
                    <NavegadorPaginas
                        bind:pagina
                        bind:paginaActual
                        bind:totalPaginas={paginaMaxima}
                        on:irAlPrimero={() => {
                            pagina = 1;
                            cambiarPagina();
                        }}
                        on:irAlAnterior={() => {
                            pagina = paginaActual - 1;
                            cambiarPagina();
                        }}
                        on:irAlSiguiente={() => {
                            pagina = paginaActual + 1;
                            cambiarPagina();
                        }}
                        on:irAlUltimo={() => {
                            pagina = paginaMaxima;
                            cambiarPagina();
                        }}
                        on:irAlIndicado={() => cambiarPagina()}
                    />
                {/if}
            {/if}
            {#if mostrarFormularioFlotante && !modoTelefono && scrollY > 300}
                <div
                    class="formulario-flotante"
                    transition:fly|local={{ x: -50, duration: 100 }}
                >
                    <Formulario
                        {hilo}
                        bind:comentarioStore
                        on:comentarioCreado={cargarNuevosComentarios}
                        bind:hide
                        bind:hide_flag
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
    .lista-stickies :global(.comentario-flotante .color) {
        box-shadow: none !important;
    }
    .lista-stickies :global(.sticky) {
        padding: 5px;
        margin-bottom: 4px;
        font-size: 0.9rem;
    }
    .lista-stickies :global(.sticky .color) {
        width: 40px;
        height: 40px;
        box-shadow: 0px 0px 1px 1px var(--color6);
        margin: 5px 5px;
    }
    /*.lista-stickies :global(.sticky .color:after),
    .lista-stickies :global(.sticky .color:before) {
        display: none;
    }*/
    .lista-stickies :global(.sticky .media) {
        width: 25%;
    }
    .lista-stickies :global(.sticky .media.abierto) {
        width: 100%;
    }
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
