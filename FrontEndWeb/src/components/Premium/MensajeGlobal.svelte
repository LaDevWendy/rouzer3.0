<script>
    import { Button } from "svelte-mui";
    import { abrir } from "./DialogosPremium.svelte";
    import globalStore from "../../globalStore";
    export let mg;
</script>

<div class="super-container mg-{mg.color}">
    <div
        class="container"
        style="background: linear-gradient(90deg, rgba(0,0,0,0.1) {mg.completado}%, rgba(0,0,0,0.0) {mg.completado}%);"
    >
        {#if $globalStore.usuario.esAdmin}
            <div class="mg-mods">
                <Button
                    icon
                    dense
                    style="height: 26px; width: 26px"
                    color="black"
                    on:click={() => abrir.eliminarMensajeGlobal(mg.id)}
                >
                    <span class="fe fe-x" />
                </Button>
            </div>
        {/if}
        <div class="content">
            {@html mg.mensaje}
        </div>
    </div>
</div>

<style>
    .super-container {
        margin-top: 4px;
        margin-left: 4px;
        margin-bottom: 4px;
        margin-right: 8px;
        border-style: solid;
        border-radius: 4px;
        border-width: 4px;
    }

    .container {
        padding-top: 4px;
        padding-left: 4px;
        padding-bottom: 4px;
        padding-right: 2%;
        display: grid;
        grid-template-columns: 10% 90%;
    }

    .content {
        grid-column: 2;
        grid-row: 1;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 4px;
        padding: 4px;
        white-space: normal;
        word-break: break-word;
        overflow: hidden;
        color: white;
    }
    .content :global(a) {
        color: var(--color6) !important;
    }
    .mg-mods {
        grid-column: 1;
        grid-row: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .mg-rojo {
        background-color: #dd3226;
        border-color: #b3261c;
    }
    .mg-naranja {
        background-color: #ff9f00;
        border-color: #cc7f00;
    }
    .mg-amarillo {
        background-color: #ffc400;
        border-color: #cc9d00;
    }
    .mg-verde {
        background-color: #53a538;
        border-color: #42842d;
    }
    .mg-azul {
        background-color: #00408a;
        border-color: #00336e;
    }
    .mg-blanco {
        background-color: white;
        border-color: #cccccc;
    }
</style>
