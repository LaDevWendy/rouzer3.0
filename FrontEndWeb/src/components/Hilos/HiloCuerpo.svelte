<script>
    import Media from "../Media.svelte";
    export let hilo = null
</script>

<div class="cuerpo">
    <Media media={hilo.media}/>
    <h1 style="margin-bottom:16px">{hilo.titulo}</h1>
    <div class="texto" style="white-space: pre-wrap;word-break: break-word;">{@html hilo.contenido}</div>
</div>

<style>
    :global(.media) {
        float: left;
        margin-right: 10px;
        max-width: 50%;
        overflow: hidden;
    }
    .cuerpo {
        padding: 0 10px;
    }
    @media (max-width: 992px) {
	.cuerpo :global(.media) {
		max-width: 100%;
		width: 100% !important;
		float: none
	}
    .cuerpo :global(a) {
        color: var(--color5) !important;
    }
}
</style>