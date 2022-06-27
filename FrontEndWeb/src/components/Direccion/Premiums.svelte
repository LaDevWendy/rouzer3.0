<script>
    import ListaDePremiums from "./ListaDePremiums.svelte";

    let { premiums } = window.model;
</script>

<div class="row">
    <section>
        <h3>Usuarios con membrecía premium activa</h3>
        <ListaDePremiums {premiums} />
    </section>
</div>

<style>
    .row {
        margin: auto;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        max-width: 1270px;
        margin: auto;
    }
    .row > section {
        flex: 1;
    }
    section {
        max-width: 400px;
        width: max-content;
        min-width: 270px !important;
    }
</style>
