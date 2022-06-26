<script>
    import Pedido from "./Pedido.svelte";
    export let pedidos;
    export let propio;
</script>

<ul>
    {#if pedidos.length == 0}
        No tienes pedidos registrados
    {/if}
    {#each pedidos as p}
        <Pedido {p} {propio} />
    {/each}
</ul>
