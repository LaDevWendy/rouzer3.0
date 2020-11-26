<script context="module">
    import {writable} from 'svelte/store'

    export const selectorDeComentarios = writable({
        activado: true,
        comentariosSeleccionados: []
    })
    

</script>
<script>

</script>

<div class="selector-comentarios">
    {#each $selectorDeComentarios.comentariosSeleccionados as  comentarioId}
        {comentarioId}
    {/each}
</div>

<style>
    .selector-comentarios {
        position: fixed;
        left: 10px;
        bottom: 60px;
        background: black;
        color: white;
    }
</style>

