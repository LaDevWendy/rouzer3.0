<script>
    import { Ripple } from "svelte-mui";
    import globalStore from "../../globalStore";
    import Denuncia from "../Denuncia.svelte";

    let denuncias = window.denuncias || [];

    let mostrar = false;
</script>

{#if $globalStore.usuario?.esMod}
    <span on:click={() => mostrar = !mostrar } class="nav-boton" style="height:100%;position:relative">
        <Ripple />
        <span class="fe fe-alert-circle" />
        {#if denuncias.length != 0}
            <div class="noti-cont" style="position: absolute;">
                <span>{denuncias.length}</span>
            </div>
        {/if}
    </span>

    {#if mostrar}
        <div class="denuncias-nav">
            <ul>
                {#each denuncias as d}
                    <Denuncia bind:denuncia={d} />
                {/each}
            </ul>
        </div>
    {/if}

{/if}

<style>
    .denuncias-nav {
        position: absolute;
        right: -29px !important;
        top: 51px;
        left: auto;
        padding: 4px;
        min-width: 400px;
        width: fit-content;
        z-index: 10;
        background:var(--color5);
        font-size: 0.7em;
        max-height: 90vh;
        overflow-x: scroll;
    }
    ul :global(.hilo) 
    {
        width: 100%;
        height: 100px !important
    }
    ul :global(.hilo img) 
    {
        height: fit-content;
    }
</style>