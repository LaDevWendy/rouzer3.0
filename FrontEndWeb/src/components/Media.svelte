<script>
    import MediaType from "../MediaType";
    import {onMount} from "svelte/";
    import {Icon, Button} from "svelte-mui"

    export let media

    let abierto = false 
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
    {#if media.tipo  == MediaType.Imagen}
        {#if media.esGif}
            <a href="/{media.url}" target="_blank">
                <img src="/{media.url}" alt="" srcset="">
            </a>
        {:else}
            <a href="/{media.url}" target="_blank">
                <img src="{media.vistaPrevia}" alt="" srcset="">
            </a>
        {/if}
        {:else if media.tipo == MediaType.Video}
        
            {#if abierto}
                <video bind:this={vid} loop controls  src="/{media.url}" style="margin-bottom: 16px;"></video>
                <Button on:click={() => abierto = false} class="cerrar" icon>
                    <i class="fe fe-x"></i> 
                </Button>
                {:else}
                <img on:click={abrirVideo} src="{media.vistaPrevia}" alt="" srcset="">
                <Button on:click={abrirVideo}  color="red" class="play" icon>
                    <i class="fe fe-play" style="position: relative;left: 2px;"></i> 
                </Button>
            {/if}
    {/if}
</div>

<style>
    video, img {
        border-radius: 4px
    }
    .media {
        position: relative;
        width: 50%;
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
</style>