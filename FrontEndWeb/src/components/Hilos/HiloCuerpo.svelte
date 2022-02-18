<script>
    import Media from "../Media.svelte";
    import Audio from "../Audio.svelte";
    export let hilo = null;

    let mediaExpandido = false;
</script>

<div class="cuerpo markdown-body" class:mediaExpandido>
    <Media media={hilo.media} bind:abierto={mediaExpandido} />
    {#if hilo.audio}
        <Audio urlBlobAudio={hilo.audio.url} />
    {/if}
    <h1 style="margin-bottom:16px">{hilo.titulo}</h1>
    <div class="texto" style="white-space: pre-wrap;word-break: break-word;">
        {@html hilo.contenido}
    </div>
</div>

<style>
    .texto {
        overflow: auto;
    }
    .mediaExpandido {
        display: flex;
        flex-wrap: wrap;
    }

    .mediaExpandido h1,
    .mediaExpandido .texto {
        width: 100%;
    }

    :global(.media) {
        float: left;
        margin-right: 10px;
        max-width: 50%;
        overflow: hidden;
        clear: both;
    }
    :global(audio) {
        float: left;
        clear: both;
        margin-right: 10px;
    }
    .cuerpo {
        padding: 0 10px;
        direction: rtl;
    }
    .cuerpo :global(*) {
        direction: ltr;
    }
    @media (max-width: 992px) {
        .cuerpo :global(.media) {
            max-width: 100%;
            width: 100% !important;
            float: none;
        }
        .cuerpo :global(audio) {
            float: none;
        }
        .cuerpo :global(a) {
            color: var(--color5) !important;
        }

        @media (max-width: 600px) {
            h1 {
                font-weight: bold !important;
            }
        }
    }
</style>
