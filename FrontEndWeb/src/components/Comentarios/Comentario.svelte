<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import { Menuitem, Button, Icon, Ripple } from "svelte-mui";
    import Menu from "../Menu.svelte";
    //import comentarioStore from "./comentarioStore";
    import { fly } from "svelte/transition";
    import ajustesConfigStore from "../Dialogos/ajustesConfigStore";
    import Tiempo from "../Tiempo.svelte";
    import globalStore from "../../globalStore";
    import Media from "../Media.svelte";
    import { abrir } from "../Dialogos/Dialogos.svelte";
    import { ComentarioEstado, CreacionRango } from "../../enums";
    import selectorStore from "../Moderacion/selectorStore";
    import teclas from "../../shorcuts";
    import RChanClient from "../../RChanClient";
    // import Audio from "../Audio.svelte";
    import MediaType from "../../MediaType";
    import Spinner from "../Spinner.svelte";

    export let comentario;
    export let hilo = { id: null };
    export let comentariosDic = {};
    export let resaltado = false;
    export let prevenirScroll =
        $globalStore.esCelular && !$ajustesConfigStore.tagClasico;
    export let respuetasCompactas = false;

    export let esRespuesta = false;
    export let esSticky = false;

    comentario.estado = comentario.estado || ComentarioEstado.normal;

    let el;
    let mostrandoRespuesta = false;
    let respuestaMostrada;

    let mediaExpandido = false;

    let windowsWidh = window.screen.width;

    let visible =
        !$globalStore.comentariosOcultos.has(comentario.id) ||
        comentario.propio;

    let dispatch = createEventDispatcher();

    let mostrarMenu = false;

    onMount(() => {
        let respuestas = el.querySelectorAll(".restag");
        respuestas.forEach((r) => {
            r.addEventListener("mouseover", () =>
                mostrarRespuesta(r.getAttribute("r-id").trim())
            );
            r.addEventListener("mouseleave", ocultarRespuesta);
            r.addEventListener("click", (e) => {
                resaltarCliqueado(r.getAttribute("r-id").trim());
                if (prevenirScroll) {
                    e.preventDefault();
                } else {
                    irAComentario(r.getAttribute("r-id").trim());
                }
            });
        });
    });

    function mostrarRespuesta(id) {
        if (!comentariosDic[id]) return;
        mostrandoRespuesta = true;
        respuestaMostrada = comentariosDic[id];
    }

    function resaltarCliqueado(id) {
        dispatch("tagClickeado", id);
    }

    function irAComentario(id) {
        dispatch("irAComentario", id);
    }

    function onClickRespuesta(e, id) {
        resaltarCliqueado(id);
        if (prevenirScroll) {
            e.preventDefault();
        } else {
            irAComentario(id);
        }
    }

    function tagear(id) {
        dispatch("tagear", id);
    }

    function ocultarRespuesta() {
        mostrandoRespuesta = false;
    }

    function toggle() {
        if (visible) {
            $globalStore.comentariosOcultos.set(comentario.id, true);
        } else {
            $globalStore.comentariosOcultos.delete(comentario.id);
        }
        $globalStore.comentariosOcultos = $globalStore.comentariosOcultos;
        visible = !visible;
    }

    function seleccionar() {
        if (!$globalStore.usuario.esAuxiliar) return;
        selectorStore.selecionar(comentario.id);
    }

    if (!Array.isArray(comentario.respuestas)) comentario.respuestas = [];

    function esOp(comentarioId) {
        let comentario = comentariosDic[comentarioId] || { esOp: false }; //??quitado
        return comentario.esOp;
    }

    function idUnicoColor() {
        let coloresPosibles = [
            "#7bd800",
            "#00d87e",
            "#006ad8",
            "#3500d8",
            "#8500d8",
            "#d80096",
            "#737679",
            "#5d130b",
            "#ec64e2",
            "#ff5722",
        ];
        let n =
            comentario.idUnico.charCodeAt(0) +
            comentario.idUnico.charCodeAt(1) +
            comentario.idUnico.charCodeAt(2);
        return coloresPosibles[(n % coloresPosibles.length) - 1];
    }

    async function onContexMenu(e) {
        if (teclas.estaPresionada("x") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            RChanClient.eliminarComentarios([comentario.id]);
        }
    }

    let stickeando = false;
    async function togglesticky() {
        stickeando = true;
        try {
            let res = await RChanClient.toggleSticky(comentario.id);
            console.log(res.data);
        } catch (error) {
            console.log(error);
        }
        stickeando = false;
    }

    let ignorando = false;
    async function toggleignorar() {
        ignorando = true;
        try {
            let res = await RChanClient.toggleIgnorar(comentario.id);
            comentario.ignorado = !comentario.ignorado;
            console.log(res.data);
        } catch (error) {
            console.log(error);
        }
        ignorando = false;
    }

    let spoilering = false;
    async function toggleSpoiler() {
        spoilering = true;
        try {
            let res = await RChanClient.toggleSpoiler(comentario.id);
            console.log(res.data);
        } catch (error) {
            console.log(error);
        }
        spoilering = false;
    }
</script>

<div
    bind:this={el}
    class:resaltado={comentario.resaltado ||
        resaltado ||
        $selectorStore.seleccionados.has(comentario.id)}
    class="comentario {windowsWidh <= 400 ? 'comentario-movil' : ''}"
    class:eliminado={comentario.estado == ComentarioEstado.eliminado}
    class:comentarioDev={comentario.rango == CreacionRango.Dev}
    class:comentarioAdmin={comentario.rango == CreacionRango.Admin}
    class:comentarioMod={comentario.rango == CreacionRango.Mod}
    class:comentarioAuxiliar={comentario.rango == CreacionRango.Auxiliar}
    class:propio={comentario.propio}
    class:sticky={comentario.sticky}
    r-id={comentario.id}
    id="{comentario.id}{esRespuesta ? '-res' : ''}{esSticky ? '-sticky' : ''}"
    style={comentario.respuestas && comentario.respuestas.length > 0
        ? "padding-bottom: 20px"
        : ""}
    on:contextmenu={onContexMenu}
>
    {#if comentario.respuestas && comentario.respuestas.length > 0}
        <div
            class="respuestas-compactas"
            on:click={() => dispatch("motrarRespuestas", comentario.id)}
        >
            R: {comentario.respuestas && comentario.respuestas.length}
        </div>
        <div class="respuestas">
            {#each comentario.respuestas as r (r)}
                <a
                    href="#{r}"
                    class="res"
                    r-id={r}
                    on:mouseover={() => mostrarRespuesta(r)}
                    on:mouseleave={ocultarRespuesta}
                    on:click={(e) => onClickRespuesta(e, r)}
                    >&gt;&gt;{r}{esOp(r) ? "(OP)" : ""}
                </a>
            {/each}
        </div>
    {/if}
    <div
        on:click={() => dispatch("colorClick", comentario)}
        class="color color-{comentario.color} ns"
        class:dado={comentario.dados != undefined && comentario.dados != -1}
    >
        {#if comentario.millon > 0}
            {comentario.millon}
        {:else if comentario.dados != undefined && comentario.dados != -1}
            {comentario.dados}
        {:else if comentario.rango}
            {CreacionRango.aString(comentario.rango).toUpperCase()}
        {:else}
            ANON
        {/if}
    </div>
    <div class="header">
        {#if comentario.esOp} <span class="nick tag tag-op">OP</span>{/if}
        <span
            on:click={seleccionar}
            class:nombreResaltado={comentario.nombre || comentario.millon > 0}
            class:nombrePremium={comentario.premium}
            class="nick nombre cptr"
            >{comentario.millon > 0
                ? "Especial"
                : comentario.nombre || (comentario.premium ? "GOLDO" : "Gordo")}
        </span>
        {#if comentario.banderita}
            <span class="banderita f32"
                ><span class="flag {comentario.banderita}" /></span
            >{/if}
        {#if comentario.idUnico}
            <span
                on:click={() =>
                    dispatch("idUnicoClickeado", comentario.idUnico)}
                class="tag ns cpt idunico"
                style={`background:${idUnicoColor()};`}
            >
                {comentario.idUnico}
                <Ripple color="var(--color5)" />
            </span>
        {/if}
        {#if comentario.usuarioId}
            <a
                href="/Moderacion/HistorialDeUsuario/{comentario.usuarioId}"
                style="color:var(--color6) !important"
            >
                <span class="nick">{comentario.usuarioId.split("-")[0]}</span>
            </a>
        {/if}
        <!-- <span class="rol tag">anon</span> -->
        <span class="id tag ns" on:click={() => tagear(comentario.id)}
            >{comentario.id}</span
        >
        <span class="tiempo"><Tiempo date={comentario.creacion} /></span>

        <div>
            {#if $globalStore.usuario.esAuxiliar}
                <Menu>
                    <span
                        slot="activador"
                        on:click={() => (mostrarMenu = !mostrarMenu)}
                        class=""
                        ><i class="fe fe-more-vertical relative" /></span
                    >
                    {#if comentario.op}
                        <Spinner cargando={stickeando}>
                            <li on:click={() => togglesticky()}>
                                {comentario.sticky ? "Desanclar" : "Anclar"}
                            </li></Spinner
                        >
                    {/if}
                    {#if comentario.propio}
                        <Spinner cargando={ignorando}>
                            <li on:click={toggleignorar}>
                                {comentario.ignorado ? "Seguir" : "Ignorar"}
                            </li></Spinner
                        >
                    {:else}
                        <li on:click={toggle}>
                            {visible ? "Ocultar" : "Mostrar"}
                        </li>
                    {/if}
                    <li
                        on:click={() =>
                            abrir.reporte(
                                hilo.id || comentario.hiloId,
                                comentario.id
                            )}
                    >
                        Reportar
                    </li>
                    <hr />
                    {#if comentario.hiloId}
                        <a
                            href="/Hilo/{comentario.hiloId}#{comentario.id}"
                            style="color:var(--color-texto1)"
                        >
                            <Menuitem>Ir</Menuitem>
                        </a>
                    {/if}
                    <Menuitem
                        on:click={() =>
                            abrir.ban(
                                hilo.id || comentario.hiloId,
                                comentario.id
                            )}>Banear</Menuitem
                    >
                    {#if comentario.estado == ComentarioEstado.normal}
                        <Menuitem
                            on:click={() =>
                                abrir.eliminarComentarios([comentario.id])}
                            >Eliminar</Menuitem
                        >
                    {:else}
                        <Menuitem
                            on:click={() =>
                                abrir.restaurarComentario(
                                    hilo.id || comentario.hiloId,
                                    comentario.id
                                )}>Restaurar</Menuitem
                        >
                    {/if}
                    {#if $globalStore.usuario.esMod && comentario.media && comentario.media.tipo != MediaType.Eliminado}
                        <Menuitem
                            on:click={() =>
                                abrir.eliminarMedia([comentario.media.id])}
                            >Eliminar media</Menuitem
                        >
                    {/if}
                    <Spinner cargando={spoilering}>
                        <Menuitem on:click={toggleSpoiler}>Spoiler</Menuitem>
                    </Spinner>
                </Menu>
            {:else}
                <div class="acciones-comentario">
                    <Button
                        icon
                        color="red"
                        style="width:32px;height:16px;"
                        on:click={() =>
                            abrir.reporte(
                                hilo.id || comentario.hiloId,
                                comentario.id
                            )}
                    >
                        <icon class="fe fe-flag" />
                    </Button>
                    {#if comentario.op}
                        <Button
                            icon
                            color={comentario.sticky
                                ? "var(--color6)"
                                : "var(--color-texto2)"}
                            style="width:32px;height:16px;"
                            disabled={stickeando}
                            on:click={togglesticky}
                            title={comentario.sticky ? "Desanclar" : "Anclar"}
                        >
                            <Spinner cargando={stickeando}>
                                <icon class="fe fe-anchor" /></Spinner
                            >
                        </Button>
                    {/if}
                    {#if comentario.propio}
                        <Button
                            icon
                            color="var(--color-texto2)"
                            style="width:32px;height:16px;"
                            disabled={ignorando}
                            on:click={toggleignorar}
                            title={comentario.ignorado
                                ? "Recibir notificaciones"
                                : "Ignorar notificaciones"}
                            ><Spinner cargando={ignorando}>
                                {#if comentario.ignorado}
                                    <icon class="fe fe-bell" />
                                {:else}
                                    <icon class="fe fe-bell-off" />
                                {/if}
                            </Spinner>
                        </Button>
                    {:else}
                        <Button
                            icon
                            color={"var(--color-texto2)"}
                            style="width:32px;height:16px;"
                            on:click={toggle}
                            title={visible ? "Ocultar" : "Mostrar"}
                        >
                            {#if visible}
                                <icon class="fe fe-eye-off" />
                            {:else}
                                <icon class="fe fe-eye" />
                            {/if}
                        </Button>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
    <div class="respuestas" />
    {#if visible}
        <div class="contenido" class:mediaExpandido>
            {#if comentario.media}
                <Media
                    media={comentario.media}
                    bind:spoiler={comentario.spoiler}
                    bind:abierto={mediaExpandido}
                />
            {/if}
            <!--{#if comentario.audio}
                <Audio urlBlobAudio={comentario.audio.url} />
            {/if}-->
            <span class="texto">
                {@html comentario.contenido}
            </span>
        </div>
    {/if}
    {#if mostrandoRespuesta}
        <div
            transition:fly|local={{ x: -50, duration: 150 }}
            class="comentario-flotante"
        >
            <svelte:self comentario={respuestaMostrada} esRespuesta={true} />
        </div>
    {/if}
</div>

<style>
    .comentario {
        display: grid;
        row-gap: 7px;
        column-gap: 10px;
        grid-template-columns: 50px calc(100% - 60px);
        grid-template-areas:
            "color header"
            "color respuestas"
            "color cuerpo";
        grid-template-rows: auto auto auto;
        padding: 10px;
        position: relative;
        margin-bottom: 8px;
        text-underline-position: under;
        transition: 0.1s background-color linear;
        position: relative;
    }
    .acciones-comentario {
        display: flex;
        flex-direction: row;
    }
    .comentario .contenido {
        grid-area: cuerpo;
        overflow: auto;
    }
    .mediaExpandido {
        display: flex;
        flex-wrap: wrap;
    }
    :global(.media) {
        margin-bottom: 10px;
    }
    /*:global(audio) {
        margin-bottom: 10px;
    }*/

    .comentario .texto {
        white-space: pre-wrap;
        word-break: break-word;
        overflow: hidden;
    }

    .respuestas {
        font-size: 0.7em;
        flex-wrap: wrap;
        display: flex;
        gap: 4px;
        flex-direction: row-reverse;
        justify-content: flex-end;
        grid-row: 2;
    }
    .respuestas-compactas {
        grid-row: 2;
        background: var(--color4);
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 5px 10px;
        border-radius: 10px 0 0 0px;
        font-size: 12px;
        color: var(--color5);
        cursor: pointer;
    }

    .contenido .media {
        float: left;
        margin-right: 10px;
        max-width: 50%;
        clear: both;
    }

    /*.contenido audio {
        float: left;
        margin-right: 10px;
        clear: both;
    }*/

    .color {
        width: 50px;
        height: 50px;
        background: orange;
        grid-area: color;
        display: flex;
        align-items: center;
        padding: 2px;
        /* text-align: center; */
        font-stretch: condensed;
        /* border-radius: 10; */
        justify-content: center;
        font-weight: 600;
        /* color: #822f0047; */
        color: #ffffffe3;
        border-radius: 4px;
    }
    /* Gorritos */
    /*
    .color-rojo::after,
    .color-verde::after,
    .color-multi::after,
    .color-blanco::after,
    .color-negro::after,
    .comentarioMod .color::after,
    .color-navideño::after,
    .color-invertido::after {
        content: "";
        background: url(/imagenes/colores/gorrito.png);
        position: absolute;
        top: 1px;
        left: 1px;
        height: 26px;
        width: 26px;
        background-size: 85%;
        background-repeat: no-repeat;
        transform: rotate(-4deg);
    }

    .color-invertido::after {
        filter: invert(1);
    }

    .color-negro::after {
        filter: grayscale(1);
    }

    .comentarioMod .color::after {
        animation: gorro 0.3s infinite alternate-reverse;
    }

    @keyframes gorro {
        0% {
            filter: hue-rotate(0);
        }
        100% {
            filter: hue-rotate(-100deg);
        }
    }

    .color-amarillo::after,
    .color-azul::after,
    .color-marron::after,
    .color-rosa::after,
    .color-ario::after {
        background: url(/imagenes/nieve.png);
        content: "";
        position: absolute;
        top: 3px;
        height: 50px;
        width: 50px;
        background-size: 100%;
        background-repeat: no-repeat;
    }*/

    /* Año nuevo */
    /*.color::after {
        content: "";
        background: url(https://i.ibb.co/K60c4kz/gorro-resize.png);
        position: absolute;
        top: 1px;
        left: 1px;
        height: 26px;
        width: 26px;
        background-size: 85%;
        background-repeat: no-repeat;
        transform: rotate(-4deg);
    }
    .color::before {
        background: url(https://i.ibb.co/dkM9zH8/tie-recolor.png);
        content: "";
        position: absolute;
        top: 52px;
        height: 16px;
        width: 30px;
        background-size: 100%;
        background-repeat: no-repeat;
    }
    .color-invertido::after,
    .color-invertido::before {
        filter: invert(1);
    }
    .color-negro::after,
    .color-negro::before {
        filter: grayscale(1);
    }*/

    .comentario .header {
        grid-template-areas: color;
        display: flex;
        flex-wrap: wrap-reverse;
        align-items: center;
        margin-bottom: 0;
        font-size: 0.9em;
        justify-content: flex-end;
    }

    .comentario .header span {
        margin-right: 10px;
    }

    .comentario .header .id {
        cursor: pointer;
        margin-right: auto;
    }

    .comentario .tag {
        background: #000000ad;
        padding: 0 5px;
        border-radius: 500px;
        display: flex;
        align-items: center;
    }

    .comentario .tiempo {
        margin-left: auto;
        opacity: 0.5;
        font-size: 12px;
    }

    .tag-op {
        background: var(--color5) !important;
    }
    .comentario:hover {
        background: var(--color4);
    }

    .resaltado {
        background: var(--color7) !important;
    }
    .eliminado {
        border-left: solid 2px red !important;
    }

    .color-rojo {
        background: #dd3226;
    }
    .color-verde {
        background: #53a538;
    }
    .color-amarillo {
        background: #ffc400;
    }
    .color-azul {
        background: #00408a;
    }
    .color-rosa {
        background: #ff74c1;
    }
    .color-negro {
        background: #000000;
    }
    .color-marron {
        background: #492916;
    }
    .color-ario {
        color: #00abec;
        border-top: solid 4px #ffc400;
        background: white;
    }
    .color-blanco {
        color: black;
        background: white;
    }

    .color-rose-rubia {
        background: url(/imagenes/colores/rose-rubia.jpg);
        background-size: 100%;
        color: transparent;
    }
    .color-rose-azul {
        background: url(/imagenes/colores/rose-azul.jpg);
        background-size: 100%;
        color: transparent;
    }
    .color-rose-castaña {
        background: url(/imagenes/colores/rose-castaña.jpg);
        background-size: 100%;
        color: transparent;
    }
    .color-rose-violeta {
        background: url(/imagenes/colores/rose-violeta.jpg);
        background-size: 100%;
        color: transparent;
    }
    .color-tactico {
        background: url(/imagenes/colores/tactico.jpg);
        background-size: 100%;
        color: #000000;
    }
    .color-uff {
        background: url(/imagenes/colores/uff.jpg);
        background-size: 100%;
        color: #00000040;
        font-size: 2rem;
        font-family: "euroFighter";
    }
    .color-serio {
        background: #354e67;
    }

    .color-multi {
        background: linear-gradient(
            #ffc400 25%,
            #00408a 25%,
            #00408a 50%,
            #53a538 50%,
            #53a538 75%,
            #dd3226 75%,
            #dd3226 100%
        );
        animation: multi 0.3s infinite;
    }

    .color-invertido {
        background: linear-gradient(
            #003bff 25%,
            #ffbf75 25%,
            #ffbf75 50%,
            #ac5ac7 50%,
            #ac5ac7 75%,
            #22cdd9 75%,
            #22cdd9 100%
        );
        animation: invertido 0.3s infinite;
    }

    .color-navideño {
        background: linear-gradient(
            #f0202e 33.3%,
            #ffffff 33.3%,
            #ffffff 66.3%,
            #008939 66.3%,
            #008939 100%
        );
        color: #ffc400;
        animation: navideño 0.4s infinite;
    }

    .color-ruso {
        background: linear-gradient(
            #ffffff 33.3%,
            #0039a6 33.3%,
            #0039a6 66.3%,
            #d52b1e 66.3%,
            #d52b1e 100%
        );
        color: black;
    }

    .color-ucraniano {
        background: linear-gradient(#0057b7 50%, #ffd700 50%, #ffd700 100%);
        color: black;
    }

    .color-naranja {
        background: #e58f00;
    }

    @keyframes navideño {
        33.3% {
            background: linear-gradient(
                #008939 33.3%,
                #f0202e 33.3%,
                #f0202e 66.3%,
                #ffffff 66.3%,
                #ffffff 100%
            );
        }
        66.3% {
            background: linear-gradient(
                #ffffff 33.3%,
                #008939 33.3%,
                #008939 66.3%,
                #f0202e 66.3%,
                #f0202e 100%
            );
        }
        100% {
            background: linear-gradient(
                #f0202e 33.3%,
                #ffffff 33.3%,
                #ffffff 66.3%,
                #008939 66.3%,
                #008939 100%
            );
        }
    }
    @keyframes multi {
        20% {
            background: linear-gradient(
                #dd3226 25%,
                #ffc400 25%,
                #ffc400 50%,
                #00408a 50%,
                #00408a 75%,
                #53a538 75%,
                #53a538 100%
            );
        }
        60% {
            background: linear-gradient(
                #53a538 25%,
                #dd3226 25%,
                #dd3226 50%,
                #ffc400 50%,
                #ffc400 75%,
                #00408a 75%,
                #00408a 100%
            );
        }
        80% {
            background: linear-gradient(
                #00408a 25%,
                #53a538 25%,
                #53a538 50%,
                #dd3226 50%,
                #dd3226 75%,
                #ffc400 75%,
                #ffc400 100%
            );
        }
        100% {
            background: linear-gradient(
                #ffc400 25%,
                #00408a 25%,
                #00408a 50%,
                #53a538 50%,
                #53a538 75%,
                #dd3226 75%,
                #dd3226 100%
            );
        }
    }

    @keyframes invertido {
        20% {
            background: linear-gradient(
                #22cdd9 25%,
                #003bff 25%,
                #003bff 50%,
                #ffbf75 50%,
                #ffbf75 75%,
                #ac5ac7 75%,
                #ac5ac7 100%
            );
        }
        60% {
            background: linear-gradient(
                #ac5ac7 25%,
                #22cdd9 25%,
                #22cdd9 50%,
                #003bff 50%,
                #003bff 75%,
                #ffbf75 75%,
                #ffbf75 100%
            );
        }
        80% {
            background: linear-gradient(
                #ffbf75 25%,
                #ac5ac7 25%,
                #ac5ac7 50%,
                #22cdd9 50%,
                #22cdd9 75%,
                #003bff 75%,
                #003bff 100%
            );
        }
        100% {
            background: linear-gradient(
                #003bff 25%,
                #ffbf75 25%,
                #ffbf75 50%,
                #ac5ac7 50%,
                #ac5ac7 75%,
                #22cdd9 75%,
                #22cdd9 100%
            );
        }
    }

    .comentarioDev {
        border-top: solid 2px;
        border-color: greenyellow;
    }

    .comentarioDev > .color {
        background: black;
        color: greenyellow !important;
        font-family: "Courier New", Courier, monospace;
        text-transform: lowercase;
        animation: none;
    }

    .comentarioAdmin {
        border-top: solid 2px;
        animation: borde-luz-admin 2s infinite alternate-reverse;
    }

    .comentarioAdmin > .color {
        animation: lucesAdmin 10s infinite alternate-reverse,
            borde-luz-admin 2s infinite alternate-reverse;
        color: white !important;
        border-top: solid 2px;
    }

    .comentarioMod {
        border-top: solid 2px;
        animation: borde-luz 0.3s infinite alternate-reverse;
    }

    .comentarioMod > .color {
        animation: luces 0.3s infinite alternate-reverse;
        color: white !important;
    }
    .comentarioAuxiliar {
        border-top: solid 2px;
        animation: borde-serenito 0.3s infinite alternate-reverse;
    }
    .comentarioAuxiliar > .color {
        background: url(/imagenes/serenito.gif);
        background-size: 161px;
        color: transparent;
        background-position: center;
    }

    .nombreResaltado {
        color: var(--color6);
        font-weight: bold;
    }
    .nombrePremium {
        color: goldenrod;
    }

    @keyframes borde-serenito {
        0% {
            border-color: rgb(255, 136, 0);
        }
        100% {
            border-color: transparent;
        }
    }
    @keyframes borde-luz {
        0% {
            border-color: red;
        }
        100% {
            border-color: blue;
        }
    }
    @keyframes luces {
        0% {
            background: red;
            border-color: red;
        }
        100% {
            background: blue;
            border-color: blue;
        }
    }
    @keyframes borde-luz-admin {
        0% {
            border-color: rgb(204 29 29);
        }
        50% {
            border-color: #242f3d;
        }
        100% {
            border-color: whitesmoke;
        }
    }
    @keyframes lucesAdmin {
        0% {
            background: #1d334a;
        }
        50% {
            background: #242f3d;
        }
        100% {
            background: #003153;
        }
    }

    .cptr {
        cursor: pointer;
    }
    .dado {
        font-size: 2rem;
        font-family: "euroFighter";
    }

    .idunico:hover {
        color: var(--color5);
    }
    @media (max-width: 600px) {
        .comentario :global(.restag),
        .comentario :global(.res),
        .respuestas-compactas {
            font-weight: bold !important;
        }
        .comentario :global(a) {
            font-weight: bold !important;
        }
    }
    .banderita {
        width: 19px;
        overflow: hidden;
        height: 16px;
        position: relative;
        border-radius: 2px;
    }
    .banderita .flag {
        position: absolute;
        transform: scale(0.69);
        top: -8px;
        right: -17px;
    }
    .propio {
        border-bottom: solid 2px var(--color7);
    }
    .sticky {
        border-top: solid 2px var(--color6);
    }
    /* @media(max-width >600px) {} */

    /* .comentario-movil :glo.media {
  max-width: 100%;
  width: 100%;
}
.comentario-movil .color {
  height: 30px;
  position: relative;
  top: -8px;
  left: -8px;
}
.comentario-movil {
  grid-template-areas:
  "color header"
  "respuestas respuestas"
  "cuerpo cuerpo";
} */
</style>
