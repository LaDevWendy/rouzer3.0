<script>
    import ListaDeTransacciones from "./ListaDeTransacciones.svelte";

    let transacciones = window.model.transacciones;
</script>

<main>
    <section>
        <h3>Transacciones</h3>
        <ListaDeTransacciones {transacciones} />
    </section>
</main>

<style>
    main {
        margin: auto;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        max-width: 1270px;
        margin: auto;
    }
    main > section {
        flex: 1;
    }
    section {
        max-width: 400px;
        width: max-content;
        min-width: 270px !important;
    }
</style>
