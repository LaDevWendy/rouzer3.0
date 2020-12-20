<script>
    import config from '../config'
    import { Ripple } from 'svelte-mui'
    import { localStore } from '../localStore'
    export let visible = true

    let localConfig = localStore("NavCategorias", {oculta: true})
    console.log($localConfig);
    function toggle(params) {
        console.log(localConfig);
        $localConfig.oculta = !$localConfig.oculta
    }
    $: oculta = $localConfig.oculta

</script>

<nav class="nav-categorias"
    class:visible
    class:oculta>
    <div class="colapsar-categorias categoria" on:click={toggle}>
        <div class="fe fe-circle"></div>
        <Ripple color="var(--color5)"/>
    </div>
    {#each config.categorias as c (c.id)}
        <a class="categoria" href="/{c.nombreCorto}" title={c.nombre}>{c.nombreCorto}</a>
    {/each}
</nav>

<style>
    .nav-categorias {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 8px;
        justify-content: center;
        margin-top: 10px;
        gap: 4px 0;
        transition: 0.2s;
    }

    .categoria {
        padding: 2px 6px !important;
        grid-column: 1/21;
        padding: 2px 8px;
        font-size: 14px;
        color: rgb(236, 244, 255);
        display: flex;
        align-items: center;
        height: fit-content;
        align-items: center;
        font-stretch: condensed;
        background: var(--color5);
        transition: 0.2s;
    }
    .categoria:first-child {
        border-radius: 20px 0 0 20px;
    }
    .categoria:last-child {
        border-radius: 0 20px 20px 0;
    }

    .colapsar-categorias {
        font-size: 16px;
        transition: 0.2s;
    }

    .oculta a {
        display: none;
        font-size: 10px !important;
    }

    .oculta {
        margin: 0;
        justify-content: left;
    }
    .oculta .colapsar-categorias {
        /* border-radius: 0 20px 20px 0; */
        border-radius: 0 0 11px 0px;
        background: var(--color5);
        font-size: 10px;
    }
    @media(max-width:600px) {
        .nav-categorias {display: none}
    }
</style>