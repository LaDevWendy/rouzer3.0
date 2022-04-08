<script>
    import { Button } from "svelte-mui";
    import { createEventDispatcher } from "svelte";

    let dispatch = createEventDispatcher();

    function irAlPrimero() {
        dispatch("irAlPrimero");
    }
    function irAlAnterior() {
        dispatch("irAlAnterior");
    }
    function irAlSiguiente() {
        dispatch("irAlSiguiente");
    }
    function irAlUltimo() {
        dispatch("irAlUltimo");
    }
    function irAlIndicado() {
        dispatch("irAlIndicado");
    }

    export let paginaActual = 1;
    export let pagina = 1;
    export let totalPaginas;
</script>

<div class="panel contador-comentarios navegador">
    <Button title="Primera" dense icon on:click={irAlPrimero}>&lt;&lt;</Button>
    <Button title="Anterior" dense icon on:click={irAlAnterior}>&lt;</Button>
    <span title="Actual" class="pagina-actual"
        >{paginaActual}/{totalPaginas}</span
    >
    <Button title="Siguiente" dense icon on:click={irAlSiguiente}>&gt;</Button>
    <Button title="Última" dense icon on:click={irAlUltimo}>&gt;&gt;</Button>
    <input type="number" class="pagina" bind:value={pagina} />
    <Button title="Ir a página" dense icon on:click={irAlIndicado}>Ir</Button>
</div>

<style>
    .navegador {
        justify-content: center;
    }
    .pagina {
        width: 75px;
        text-align: right;
        background-color: var(--color4);
        border-radius: 4px;
    }
    .pagina-actual {
        margin-left: 9px;
        margin-right: 9px;
    }
</style>
