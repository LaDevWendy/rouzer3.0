<script>
    import ListaDePedidos from "./ListaDePedidos.svelte";

    let { pedidos, propio } = window.model;
</script>

<main>
    <section>
        <h3>Pedidos</h3>
        <ListaDePedidos {pedidos} {propio} />
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
