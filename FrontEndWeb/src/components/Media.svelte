<script>
    import MediaType from "../MediaType";
    import { onMount } from "svelte/";
    import { Icon, Button, Ripple } from "svelte-mui";
    import RChanClient from "../RChanClient";
    import ajustesConfigStore from "./Dialogos/ajustesConfigStore";

    export let media;
    export let modoCuadrado = false;
    export let spoiler = false;

    let botoncitos = $ajustesConfigStore.botoncitos;

    $: vistaPrevia = modoCuadrado
        ? media.vistaPreviaCuadrado
        : media.vistaPrevia;

    export let abierto = false;
    let oculto = false;
    let vid;

    function quitarSpoiler() {
        spoiler = false;
    }

    function abrirVideo() {
        quitarSpoiler();
        abierto = true;
        setTimeout(async () => {
            if (vid != undefined) {
                await vid.play();
                vid.muted = true;
            }
        }, 1);
    }

    //let hackYoutubeActivo = false;
    //let hackYoutubeLink = "";

    /*async function hackYoutube() {
        var res = await RChanClient.hackYoutube(media.url);
        hackYoutubeLink = res.data.link;
        hackYoutubeActivo = true;
        abrirVideo();
    }*/
</script>

<div
    class="media"
    class:abierto
    class:modoCuadrado
    class:youtube={media.tipo == MediaType.Youtube}
    class:spoiler
>
    {#if !abierto}
        <div class="ocultar">
            <Button on:click={() => (oculto = !oculto)} class="cerrar" icon>
                <i class="fe fe-eye{!oculto ? '-off' : ''}" />
            </Button>
        </div>
    {/if}
    {#if oculto}
        <div style="height:64px;" />
    {:else if media.tipo == MediaType.Imagen}
        {#if media.esGif}
            {#if spoiler}
                <img src={vistaPrevia} alt="" srcset="" />
                <Button
                    color="red"
                    class="alerta"
                    icon
                    on:click={quitarSpoiler}
                >
                    <i class="fe fe-alert-triangle" />
                </Button>
            {:else}
                <a class:botoncitos href="/Media/{media.url}" target="_blank">
                    <img src="/Media/{media.url}" alt="" srcset="" />
                </a>
            {/if}
        {:else if spoiler}
            <img src={vistaPrevia} alt="" srcset="" />
            <Button color="red" class="alerta" icon on:click={quitarSpoiler}>
                <i class="fe fe-alert-triangle" />
            </Button>
        {:else}
            <a class:botoncitos href="/Media/{media.url}" target="_blank">
                <img src={vistaPrevia} alt="" srcset="" />
            </a>
        {/if}
        {#if botoncitos}
            <div class="youtube-footer">
                <a href="/Media/{media.url}" download={media.url}
                    >Descargar <Ripple /></a
                >
            </div>
        {/if}
    {:else if media.tipo == MediaType.Video}
        {#if abierto}
            <video
                muted
                bind:this={vid}
                loop
                controls
                src="/Media/{media.url}"
            />
            <Button on:click={() => (abierto = false)} class="cerrar" icon>
                <i class="fe fe-x" />
            </Button>
        {:else if spoiler}
            <img src={vistaPrevia} alt="" srcset="" />
            <Button color="red" class="alerta" icon on:click={quitarSpoiler}>
                <i class="fe fe-alert-triangle" />
            </Button>
        {:else}
            <img on:click={abrirVideo} src={vistaPrevia} alt="" srcset="" />
            <Button on:click={abrirVideo} color="red" class="play" icon>
                <i class="fe fe-play" style="position: relative;left: 2px;" />
            </Button>
        {/if}
        {#if botoncitos}
            <div class="youtube-footer">
                <a href="/Media/{media.url}" download={media.url}
                    >Descargar <Ripple /></a
                >
            </div>
        {/if}
    {:else if media.tipo == MediaType.Youtube}
        {#if abierto}
            <!--{#if !hackYoutubeActivo}-->
            <div class="youtube-container">
                <iframe
                    title="youtube"
                    allowfullscreen
                    src="https://www.youtube.com/embed/{media.hash}?autoplay=1"
                />
            </div>
            <!--{:else}
                <video bind:this={vid} loop controls src={hackYoutubeLink} />
            {/if}-->
            <Button on:click={() => (abierto = false)} class="cerrar" icon>
                <i class="fe fe-x" />
            </Button>
        {:else if spoiler}
            <img src={vistaPrevia} alt="" srcset="" />
            <Button color="red" class="alerta" icon on:click={quitarSpoiler}>
                <i class="fe fe-alert-triangle" />
            </Button>
        {:else}
            <img on:click={abrirVideo} src={vistaPrevia} alt="" srcset="" />
            <Button on:click={abrirVideo} color="red" class="play" icon>
                <i class="fe fe-youtube fe-youtube-position" />
            </Button>
        {/if}
        <div class="youtube-footer">
            <!--{#if !hackYoutubeActivo}
                <span
                    class="medialink cpt"
                    on:click={hackYoutube}
                    title="Sirve para reproducir el video en el sitio aunque este bloqueado"
                >
                    Hack <Ripple /></span
                >
            {:else}
                <span
                    class="medialink cpt"
                    on:click={() => (hackYoutubeActivo = false)}
                >
                    Volver <Ripple /></span
                >
            {/if}-->
            <a
                class="medialink"
                target="_blanck"
                href="https://www.youtube.com/watch/{media.hash}"
            >
                Abrir en Jewtube
                <Ripple />
            </a>
        </div>
    {:else if media.tipo == MediaType.Bitchute}
        {#if abierto}
            <div class="youtube-container">
                <iframe
                    title="bitchute"
                    scrolling="no"
                    frameborder="0"
                    style="border: none;"
                    src="https://www.bitchute.com/embed/{media.hash.replace(
                        /[a-zA-Z]*_/g,
                        ''
                    )}/"
                    allow="autoplay"
                />
            </div>
            <Button on:click={() => (abierto = false)} class="cerrar" icon>
                <i class="fe fe-x" />
            </Button>
        {:else if spoiler}
            <img src={vistaPrevia} alt="" srcset="" />
            <Button color="red" class="alerta" icon on:click={quitarSpoiler}>
                <i class="fe fe-alert-triangle" />
            </Button>
        {:else}
            <img on:click={abrirVideo} src={vistaPrevia} alt="" srcset="" />
            <Button on:click={abrirVideo} color="red" class="play" icon>
                <i class="fe fe-youtube fe-youtube-position" />
            </Button>
        {/if}
        <div class="youtube-footer">
            <a
                class="medialink"
                target="_blanck"
                href="https://www.bitchute.com/video/{media.hash.replace(
                    /[a-zA-Z]*_/g,
                    ''
                )}/"
            >
                Abrir en Bitchute
                <Ripple />
            </a>
        </div>
    {:else if media.tipo == MediaType.DailyMotion}
        {#if abierto}
            <div class="youtube-container">
                <iframe
                    title="DailyMotion"
                    style="width:100%;height:100%;position:absolute;left:0px;top:0px;overflow:hidden"
                    frameborder="0"
                    type="text/html"
                    src="https://www.dailymotion.com/embed/video/{media.hash.replace(
                        /[a-zA-Z]*_/g,
                        ''
                    )}?autoplay=1"
                    width="100%"
                    height="100%"
                    allowfullscreen
                    allow="autoplay"
                />
            </div>
            <Button on:click={() => (abierto = false)} class="cerrar" icon>
                <i class="fe fe-x" />
            </Button>
        {:else if spoiler}
            <img src={vistaPrevia} alt="" srcset="" />
            <Button color="red" class="alerta" icon on:click={quitarSpoiler}>
                <i class="fe fe-alert-triangle" />
            </Button>
        {:else}
            <img on:click={abrirVideo} src={vistaPrevia} alt="" srcset="" />
            <Button on:click={abrirVideo} color="red" class="play" icon>
                <i class="fe fe-youtube fe-youtube-position" />
            </Button>
        {/if}
        <div class="youtube-footer">
            <a
                class="medialink"
                target="_blanck"
                href="https://dai.ly/{media.hash.replace(/[a-zA-Z]*_/g, '')}"
            >
                Abrir en DailyMotion
                <Ripple />
            </a>
        </div>
    {:else if media.tipo == MediaType.PornHub}
        {#if abierto}
            <div class="youtube-container">
                <iframe
                    title="PornHub"
                    src="https://www.pornhub.com/embed/{media.hash.replace(
                        /[a-zA-Z]*_/g,
                        ''
                    )}"
                    frameborder="0"
                    width="100%"
                    height="100%"
                    scrolling="no"
                    allowfullscreen
                />
            </div>
            <Button on:click={() => (abierto = false)} class="cerrar" icon>
                <i class="fe fe-x" />
            </Button>
        {:else if spoiler}
            <img src={vistaPrevia} alt="" srcset="" />
            <Button color="red" class="alerta" icon on:click={quitarSpoiler}>
                <i class="fe fe-alert-triangle" />
            </Button>
        {:else}
            <img on:click={abrirVideo} src={vistaPrevia} alt="" srcset="" />
            <Button on:click={abrirVideo} color="red" class="play" icon>
                <i class="fe fe-youtube fe-youtube-position" />
            </Button>
        {/if}
        <div class="youtube-footer">
            <a
                class="medialink"
                target="_blanck"
                href="https://pornhub.com/view_video.php?viewkey={media.hash.replace(
                    /[a-zA-Z]*_/g,
                    ''
                )}"
            >
                Abrir en PornHub
                <Ripple />
            </a>
        </div>
    {/if}
</div>

<style>
    .fe-youtube-position {
        position: relative;
        left: 1px;
    }
    video,
    img {
        border-radius: 4px;
        max-height: 80vh;
    }
    .media {
        position: relative;
        width: 50%;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
    }

    .media .botoncitos {
        margin-bottom: -7px;
    }

    video,
    .abierto {
        width: 100%;
        max-width: 100%;
    }

    .media :global(button) {
        position: absolute;
        top: 4px;
        right: 4px;
    }
    .media :global(.play) {
        position: absolute;
        top: 50%;
        transform: translateX(50%) translateY(-50%) scale(2);
        right: 50%;
    }
    .media :global(.alerta) {
        position: absolute;
        top: 50%;
        transform: translateX(50%) translateY(-50%) scale(5);
        right: 50%;
    }

    .youtube-container {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 56.25%;
    }

    .youtube-container iframe {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        border: none;
        border-radius: 4px;
    }

    .youtube-footer {
        /*display: flex;
        justify-content: space-between;*/
        background: var(--color1);
        width: 100%;
        text-align: center;
        padding: 2px 0;
        border-radius: 0 0 4px 4px;
        border: solid 1px black;
        border-top: none;
        font-size: 12px;
        color: #ffffffe3 !important;
        z-index: 1;
    }

    .youtube-footer .medialink {
        flex: 1;
    }

    .media .ocultar {
        opacity: 0;
        transition: 0.2s;
        z-index: 1;
    }
    .media:hover .ocultar {
        opacity: 1;
    }
    .youtube,
    iframe,
    .youtube img {
        border-radius: 4px 4px 0 0 !important;
    }
    .youtube iframe {
        border-radius: 0 !important;
    }

    .modoCuadrado {
        width: 100%;
        max-width: 100%;
    }

    .ocultar :global(button) {
        top: 0;
        right: 0;
        border-radius: 50px 0px 0 50px;
        background-color: #1a212c63 !important;
    }
    .spoiler {
        overflow: hidden;
    }
    .spoiler img {
        filter: blur(10px);
    }
</style>
