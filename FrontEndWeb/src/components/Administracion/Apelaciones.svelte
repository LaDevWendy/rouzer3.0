<script>
    import ApelacionPreview from "../Administracion/ApelacionPreview.svelte";
    import BarraModeracion from "../Moderacion/BarraModeracion.svelte";

    const apelacionesPendientes = window.model.apelacionesPendientes;
    const apelacionesResueltas = window.model.apelacionesResueltas;

    let innerWidth = window.innerWidth;
    let current = 1;
</script>

<svelte:window bind:innerWidth />

<main>
    <BarraModeracion />
    {#if innerWidth < 956}
        <div id="botones" class="tab">
            <button
                id="tab1"
                class="boton {current === 1 ? 'active' : ''}"
                on:click={() => (current = 1)}
            >
                Apelaciones pendientes
            </button>
            <button
                id="tab2"
                class="boton {current === 2 ? 'active' : ''}"
                on:click={() => (current = 2)}
            >
                Últimas apelaciones resueltas
            </button>
        </div>
    {/if}
    <div class="container">
        {#if innerWidth > 956 || current === 1}
            <ul class={innerWidth <= 956 ? "resize" : ""}>
                <h3>Apelaciones pendientes</h3>
                {#each apelacionesPendientes as a (a.id)}
                    <li>
                        <ApelacionPreview apelacion={a} />
                    </li>
                {/each}
            </ul>
        {/if}
        {#if innerWidth > 956 || current === 2}
            <ul class={innerWidth <= 956 ? "resize" : ""}>
                <h3>Últimas apelaciones resueltas</h3>
                {#each apelacionesResueltas as a (a.id)}
                    <li>
                        <ApelacionPreview apelacion={a} />
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</main>

<style>
    main {
        display: flex;
        gap: 10px;
        margin: auto;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .container {
        width: 100%;
        max-width: 1800px;
        display: flex;
        gap: 10px;
        margin: auto;
        justify-content: center;
    }
    ul {
        display: flex;
        flex-direction: column;
        width: 40%;
        min-width: 40%;
    }
    h3 {
        height: 40px;
    }
    #botones {
        display: flex;
        flex-direction: row;
        width: 100%;
        max-width: 480px;
        justify-content: space-around;
    }
    .resize {
        width: 100% !important;
        max-width: 574px;
    }
    .tab {
        overflow: hidden;
        border: 1px solid #354e67;
        background-color: #17212b;
    }
    .tab button {
        background-color: inherit;
        float: left;
        border: none;
        outline: none;
        cursor: pointer;
        padding: 14px 16px;
        transition: 0.3s;
        color: white;
        width: 33%;
    }
    .tab button:hover {
        background-color: #2b333b;
    }
    .tab button.active {
        background-color: #322029;
    }
</style>
