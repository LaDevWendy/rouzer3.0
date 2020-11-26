<script>
    import MediaType from "../MediaType";
    import {onMount} from "svelte/";
    import {Icon, Button} from "svelte-mui"

    export let media
    export let modoCuadrado = false

    $: vistaPrevia = modoCuadrado? media.vistaPreviaCuadrado : media.vistaPrevia

    let abierto = false 
    let oculto = false
    let vid


    function abrirVideo() {
        abierto = true
        console.log(vid);
        setTimeout(async () => {
            vid.play()
        }, 1)
    }

</script>

<div class="media" class:abierto>
    {#if !abierto}
        <div class="ocultar">
            <Button on:click={() => oculto = !oculto} class="cerrar" icon>
                <i class="fe fe-eye{!oculto?'-off':''}"></i> 
            </Button>
        </div>
    {/if}
    {#if oculto}
        <div style="height:64px;"></div>
    {:else if media.tipo  == MediaType.Imagen}
        {#if media.esGif}
            <a href="/{media.url}" target="_blank">
                <img src="/{media.url}" alt="" srcset="">
            </a>
        {:else}
            <a href="/{media.url}" target="_blank">
                <img src="{vistaPrevia}" alt="" srcset="">
            </a>
        {/if}
        {:else if media.tipo == MediaType.Video}
        
            {#if abierto}
                <video bind:this={vid} loop controls  src="/{media.url}" style="margin-bottom: 16px;"></video>
                <Button on:click={() => abierto = false} class="cerrar" icon>
                    <i class="fe fe-x"></i> 
                </Button>
                {:else}
                <img on:click={abrirVideo} src="{vistaPrevia}" alt="" srcset="">
                <Button on:click={abrirVideo}  color="red" class="play" icon>
                    <i class="fe fe-play" style="position: relative;left: 2px;"></i> 
                </Button>
            {/if}
        {:else if media.tipo == MediaType.Youtube}
        
            {#if abierto}
                <div class="youtube-container">
                    <iframe title="youtube" allowfullscreen src="https://www.youtube.com/embed/{media.id}?autoplay=1"> </iframe>
                </div>
                <Button on:click={() => abierto = false} class="cerrar" icon>
                    <i class="fe fe-x"></i> 
                </Button>
                {:else}
                <img on:click={abrirVideo} src="{vistaPrevia}" alt="" srcset="">
                <Button on:click={abrirVideo}  color="red" class="play" icon>
                    <i class="fe fe-youtube" style="position: relative;left: 1px;"></i> 
                </Button>
                {/if}
                <!-- <a class="medialink" target="_blanck" href="https://www.youtube.com/watch/{media.id}">https://www.youtube.com/watch/{media.id}</a> -->
    {/if}
</div>

<style>
    video, img {
        border-radius: 4px
    }
    .media {
        position: relative;
        width: 50%;
        max-height: 80vh;
        display: flex;
    }
    video, .abierto {
        width:100%;
        max-width:100%;
    }

    .media :global(button) {
        position: absolute;
        top: 4px;
        right: 4px;
    }
    .media :global(.play) {
        position: absolute;
        top:50%;
        left:50%;
        transform: translateX(-50%) translateY(-50%) scale(2);
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

    .medialink{
        background: var(--color4);
        width: 100%;
    }
    a {
        width: 100%;
    }

    .media .ocultar {
        display: none;
    }
    .media:hover .ocultar {
        display: block  ;
    }

</style>