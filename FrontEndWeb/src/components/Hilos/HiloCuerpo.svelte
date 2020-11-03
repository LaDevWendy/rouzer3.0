<script>
    import Media from "../Media.svelte";
    export let hilo = null
</script>

<div class="cuerpo">
    <Media media={hilo.media}/>
    <h1>{hilo.titulo}</h1>
    <div class="texto">{hilo.contenido}</div>
</div>

<style>
    :global(.media) {
    float: left;
    margin-right: 10px;
    max-width: 50%;
}
@media (max-width: 992px) {
	.cuerpo :global(.media) {
		max-width: 100%;
		width: 100%;
		float: none
	}
}
</style>