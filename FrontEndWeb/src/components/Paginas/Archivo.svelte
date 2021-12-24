<script>
    import Tiempo from "../Tiempo.svelte";

    let hilos = window.model;
    let cadenaDeBusqueda = "";

    $: hilosFiltrados = hilos.filter(
        (h) =>
            cadenaDeBusqueda == "" ||
            h.titulo.toLowerCase().includes(cadenaDeBusqueda)
    );
</script>

<ul class="archivo-list">
    <h1>Roz archivados {hilos.length}</h1>
    <input
        autocomplete="off"
        placeholder="Filtrar: Alguna palabra en el titulo del roz"
        autofocus
        bind:value={cadenaDeBusqueda}
    />
    {#each hilosFiltrados as h (h.id)}
        <li class:historico={h.historico}>
            <a href="/Hilo/{h.id}">{h.titulo}</a>
            <Tiempo date={h.bump} />
        </li>
    {/each}
</ul>

<style>
    .archivo-list {
        margin: 0 auto;
        max-width: 600px;
    }
    @media (max-width: 600px) {
        .archivo-list {
            margin-top: 120px;
        }
    }

    li {
        background: var(--color7);
        padding: 8px 10px;
        border-radius: 4px;
        margin-bottom: 4px;
        display: flex;
        justify-content: space-between;
    }
    h1 {
        text-align: center;
        margin-bottom: 14px;
        border: 2px solid var(--color5);
        border-bottom: none;
        padding: 10px;
    }
    input {
        margin-bottom: 10px;
    }
    .historico {
        background: var(--color6);
    }
</style>
