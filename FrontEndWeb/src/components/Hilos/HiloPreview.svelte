<script>
    import { Ripple, Button, Icon } from "svelte-mui";
    import { abrir } from "../Dialogos/Dialogos.svelte";
    import Menu from "../Menu.svelte";
    import config from "../../config";
    import globalStore from "../../globalStore";
    import MediaType from "../../MediaType";
    import { fly } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

    import more from "../../icons/more-vertical.svg";
    import RChanClient from "../../RChanClient";
    import Dado from "../Dado.svelte";

    import shortcuts from "../../shorcuts";

    export let hilo;

    let dispatch = createEventDispatcher();
    if (!hilo.cantidadComentarios) hilo.cantidadComentarios = 0;

    let categorias = config.categorias.filter(
        (c) => !c.premium || (c.premium && $globalStore.usuario.esPremium)
    );
    let media = hilo.media;
    let destellando = false;
    let visible = true;

    let mostrarMenu = false;

    $: cantidadComentarios = hilo.cantidadComentarios;

    let recienCargado = true;
    $: destellar(cantidadComentarios);
    function destellar(cantidadComentarios) {
        if (recienCargado) {
            recienCargado = false;
            return;
        }
        destellando = true;
        setTimeout(() => (destellando = false), 2000);
    }

    async function toggle() {
        visible = !visible;
        if ($globalStore.usuario.estaAutenticado) {
            await RChanClient.agregar("ocultos", hilo.id);
        } else {
        }
    }

    // setInterval(() => {
    //     hilo.cantidadComentarios+=1
    // }, Math.random() * 5000 + 4000);
    function onClick(e) {
        dispatch("click");
        console.log(e.target.nodeName);
        if (e.target.nodeName == "A" || e.target.nodeName == "H3") {
            window.location = `/Hilo/${hilo.id}`;
        }
    }

    async function onContextMenu(e) {
        // AYNS
        if (shortcuts.estaPresionada("a") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 2, false)).data
                    .mensaje
            );
            return;
        }
        // DEP
        if (shortcuts.estaPresionada("d") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 16, false)).data
                    .mensaje
            );
            return;
        }
        // ECO
        if (shortcuts.estaPresionada("e") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 29, false)).data
                    .mensaje
            );
            return;
        }
        // GNR
        if (shortcuts.estaPresionada("g") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 1, false)).data
                    .mensaje
            );
            return;
        }
        // HMR
        if (shortcuts.estaPresionada("h") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 11, false)).data
                    .mensaje
            );
            return;
        }
        // JUE
        if (shortcuts.estaPresionada("j") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 10, false)).data
                    .mensaje
            );
            return;
        }
        // LIT
        if (shortcuts.estaPresionada("l") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 12, false)).data
                    .mensaje
            );
            return;
        }
        // MUS
        if (shortcuts.estaPresionada("m") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 13, false)).data
                    .mensaje
            );
            return;
        }
        // NPC
        if (shortcuts.estaPresionada("n") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 21, false)).data
                    .mensaje
            );
            return;
        }
        // O3P
        if (shortcuts.estaPresionada("o") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 14, false)).data
                    .mensaje
            );
            return;
        }
        // PRG
        if (shortcuts.estaPresionada("p") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 18, false)).data
                    .mensaje
            );
            return;
        }
        // RS
        if (shortcuts.estaPresionada("r") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 20, false)).data
                    .mensaje
            );
            return;
        }
        // SLD
        if (shortcuts.estaPresionada("s") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 37, false)).data
                    .mensaje
            );
            return;
        }
        // TEC
        if (shortcuts.estaPresionada("t") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 23, false)).data
                    .mensaje
            );
            return;
        }
        // UMA
        if (shortcuts.estaPresionada("u") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 26, false)).data
                    .mensaje
            );
            return;
        }
        // JTB
        if (shortcuts.estaPresionada("y") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 44, false)).data
                    .mensaje
            );
            return;
        }
        // WAR
        if (shortcuts.estaPresionada("w") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            console.log(
                (await RChanClient.cambiarCategoria(hilo.id, 46, false)).data
                    .mensaje
            );
            return;
        }
        if (shortcuts.estaPresionada("c") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            abrir.cambiarCategoria(hilo.id);
            return;
        }
        if (shortcuts.estaPresionada("v") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            abrir.ban(hilo.id);
            return;
        }
        if (shortcuts.estaPresionada("x") && $globalStore.usuario.esAuxiliar) {
            e.preventDefault();
            await RChanClient.borrarHilo(hilo.id);
            return;
        }
        if (!e.ctrlKey) return;
        e.preventDefault();
        toggle();
    }
    let vistaPrevia = media.vistaPreviaCuadrado;

    function esGif() {
        if (media.url.includes(".gif") && !hilo.spoiler) {
            vistaPrevia = `/Media/${media.url}`;
        }
    }

    function reset() {
        if (media.url.includes(".gif")) {
            vistaPrevia = media.vistaPreviaCuadrado;
        }
    }
</script>

<li
    class="hilo {visible ? '' : 'hilo-oculto'}"
    on:mouseleave={() => {
        mostrarMenu = false;
    }}
    on:contextmenu={onContextMenu}
>
    {#if $globalStore.usuario.esAuxiliar}
        <div class="menu-position">
            <Menu style="top: 100%;">
                <span slot="activador">
                    <Button
                        icon
                        color="white"
                        style="margin-left: auto; border-radius: 50% 0% 0% 50%;"
                        on:click={() => (mostrarMenu = !mostrarMenu)}
                    >
                        <Icon><svelte:component this={more} /></Icon>
                        <!-- <i class="fe fe-circle"></i> -->
                    </Button>
                </span>
                <li on:click={toggle}>
                    {visible ? "Ocultar" : "Mostrar"}
                    <Ripple />
                </li>
                <li on:click={() => abrir.reporte(hilo.id, "")}>
                    Reportar <Ripple />
                </li>
                <li on:click={() => abrir.cambiarCategoria(hilo.id)}>
                    Categoria <Ripple />
                </li>
                <li on:click={() => abrir.eliminarHilo(hilo.id, "")}>
                    Eliminar <Ripple />
                </li>
                <li on:click={() => abrir.ban(hilo.id)}>Banear <Ripple /></li>
                {#if $globalStore.usuario.esMod}
                    <li on:click={() => abrir.eliminarMedia([hilo.media.id])}>
                        Eliminar media <Ripple />
                    </li>
                {/if}
            </Menu>
        </div>
    {:else}
        <div class="menu-position">
            <Button icon color="var(--color-texto2)" on:click={toggle}>
                <icon class="fe fe-eye-off" />
            </Button>
            <Button
                icon
                color="red"
                on:click={() => abrir.reporte(hilo.id, "")}
            >
                <icon class="fe fe-flag" />
            </Button>
        </div>
    {/if}

    <a
        style="background:url({vistaPrevia})"
        href="/Hilo/{hilo.id}"
        class="hilo-in{media.url.includes('.gif') && !hilo.spoiler
            ? ' es-gif'
            : ''}"
        class:spoiler={hilo.spoiler}
        on:mouseover={esGif}
        on:mouseleave={reset}
        on:click={onClick}
        transition:fly|local={{ duration: 250 }}
    >
        <!-- <a  href="#asf" class="hilo-in" :bind:id={hilo.id}}> -->
        {#if destellando}
            <div class="destello" />
        {/if}
        <!-- <img src={media.vistaPreviaCuadrado} alt="{hilo.titulo}" class="imghilo"> -->
        <div class="infos">
            {#if hilo.sticky > 0}
                <div class="info sticky-info special">
                    <Icon
                        size="17"
                        path="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12M8.8,14L10,12.8V4H14V12.8L15.2,14H8.8Z"
                    />
                </div>{/if}
            {#if hilo.nuevo}
                <div class="info nuevo">NUEVO</div>{/if}
            <div class="info" style="">
                {(
                    config.categoriaPorId(hilo.categoriaId) || {
                        nombreCorto: "??",
                    }
                ).nombreCorto}
            </div>
            <!--//??quitado-->
            {#if media.tipo == MediaType.Video}
                <div class="info video">
                    <span class="fe fe-play" />
                </div>{/if}
            {#if media.tipo == MediaType.Youtube}
                <div class="info youtube">
                    <span class="fe fe-play" />
                </div>{/if}
            {#if media.tipo == MediaType.Bitchute}
                <div class="info bitchute">
                    <span class="fe fe-play" />
                </div>{/if}
            {#if media.tipo == MediaType.DailyMotion}
                <div class="info dailymotion">
                    <span class="fe fe-play" />
                </div>{/if}
            {#if media.tipo == MediaType.PornHub}
                <div class="info pornhub">
                    <span class="fe fe-play" />
                </div>{/if}
            {#if hilo.encuesta}
                <div class="info encuesta special2">
                    <span class="fe fe-bar-chart-2" />
                </div>{/if}
            {#if hilo.dados}<Dado />{/if}
            {#if hilo.concentracion}
                <div class="info special" style="padding: 0px 0 !important;">
                    <span class="fe fe-puas" />
                </div>{/if}
            {#if hilo.maximo}
                <div class="info special">1K</div>{/if}
            {#if hilo.spoiler}
                <div
                    class="info fe fe-alert-triangle"
                    style="background: red;"
                />{/if}
            {#if hilo.serio}
                <div class="info special" style="padding: 0px 0 !important;">
                    <span class="fe fe-serio" />
                </div>{/if}
            {#if hilo.estado == 1}
                <div class="info special2">
                    <span class="fe fe-paperclip" />
                </div>{/if}
            {#if hilo.historico}
                <div class="info fe fe-anchor special2" />
            {/if}

            <div class="info">{hilo.cantidadComentarios}</div>
        </div>

        <h3>{hilo.titulo}</h3>
    </a>
</li>

<style>
    .info {
        border-radius: 0 !important;
        margin: 0;
        height: 18px !important;
    }
    .info.nuevo {
        background: #18222d;
    }
    .info.video {
        background: #18222d;
    }
    .info.youtube {
        background: #f10002;
    }
    .info.bitchute {
        background: #e33e34;
    }
    .info.dailymotion {
        background: #0062d2;
    }
    .info.pornhub {
        background: #ea8f1c;
    }

    .special {
        border-radius: 4px !important;
        margin: 0 2px;
        background: var(--color3);
    }
    .special2 {
        background: var(--color6);
    }

    .info:first-child {
        border-radius: 50px 0 0 50px !important;
    }
    .info:last-child {
        border-radius: 0 50px 50px 0 !important;
        padding-left: 0;
    }
    .sticky-info {
        background: var(--color1);
    }
    .hilo:hover :global(button) {
        background: rgb(23 33 43 / 22%) !important;
        opacity: 1;
    }
    .hilo :global(button) {
        border-radius: 50% 0% 0% 50%;
        opacity: 0.33;
    }
    .hilo :global(button:first-child) {
        border-radius: 50% 0% 0% 0%;
    }
    .hilo :global(button:last-child) {
        border-radius: 0% 0% 0% 50%;
    }
    .hilo-oculto {
        display: none;
    }
    .encuesta {
        padding: 0 !important;
        margin: 0 2px;
        width: 18px;
        display: flex;
        justify-content: center;
        border-radius: 2px !important;
    }

    /* Nuevo estilo */
    /* .infos {
        padding-top: 0;
    }
    .info:first-child {
        border-radius: 0px 0 0 7px!important;
    }
    .info:last-child {
        border-radius: 0 0px 7px 0!important;
    }
     */
    .fe-puas {
        background: url("/iconos/puas.svg");
        height: 100%;
        width: 22px;
        position: relative;
        top: -2px;
        background-size: 100%;
    }
    .fe-serio {
        background: url("/iconos/serio.svg");
        height: 100%;
        width: 22px;
        position: relative;
        top: -2px;
        background-size: 100%;
    }
    .hilo-in.es-gif {
        background-repeat: no-repeat !important;
        background-position: center !important;
        background-size: cover !important;
    }
    .spoiler {
        box-shadow: inset 0px 0px 40px 40px grey;
        overflow: hidden;
    }
    .spoiler:before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        background: inherit;
        border-radius: inherit;
        filter: blur(10px);
    }
    .menu-position {
        top: 0;
        right: 0;
        z-index: 232;
        display: flex;
        flex-direction: column;
        position: absolute;
    }
</style>
