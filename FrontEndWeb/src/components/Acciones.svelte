<script>
    import Tiempo from "./Tiempo.svelte";
    import RChanClient from "../RChanClient";
    import DialogoReporte from "../components/Dialogos/DialogoReporte.svelte";
    import { Button, ButtonGroup } from "svelte-mui";
    import { CreacionRango } from "../enums";

    export let hilo;
    export let acciones;
    let mostrarReporte = false;

    async function seguir() {
        await RChanClient.agregar("seguidos", hilo.id);
        acciones.seguido = !acciones.seguido;
    }
    async function ocultar() {
        await RChanClient.agregar("ocultos", hilo.id);
        acciones.hideado = !acciones.hideado;
    }
    async function favoritear() {
        await RChanClient.agregar("favoritos", hilo.id);
        acciones.favorito = !acciones.favorito;
    }

    let rango = "";
    if (hilo.rango > CreacionRango.Anon) {
        if (hilo.rango == CreacionRango.Mod) {
            rango = "mod";
        }
        if (hilo.rango == CreacionRango.Admin) {
            rango = "adm";
        }
        if (hilo.rango == CreacionRango.Dev) {
            rango = "dev";
        }
    }
</script>

<div class="panel acciones">
    <Button
        bind:active={acciones.seguido}
        on:click={seguir}
        color={acciones.seguido ? "var(--color5)" : "var(--color-texto2)"}
        shaped><i class="fe fe-eye" />Seg</Button
    >
    <Button
        bind:active={acciones.favorito}
        on:click={favoritear}
        color={acciones.favorito ? "var(--color5)" : "var(--color-texto2)"}
        shaped><i class="fe fe-star" />Fav</Button
    >
    <Button
        bind:active={acciones.hideado}
        on:click={ocultar}
        color={acciones.hideado ? "var(--color5)" : "var(--color-texto2)"}
        shaped><i class="fe fe-eye-off" />Hide</Button
    >

    <Button on:click={() => (mostrarReporte = true)} shaped color="red"
        ><i class="fe fe-flag" />Denunciar</Button
    >
    <Button color="var(--color-texto1)" shaped disabled
        ><i class="fe fe-clock" /><Tiempo date={hilo.creacion} /></Button
    >

    {#if hilo.rango > CreacionRango.Anon || hilo.nombre}
        <span class={rango}>
            {#if hilo.rango > CreacionRango.Anon}
                {CreacionRango.aString(hilo.rango).toUpperCase()}
            {/if}

            {#if hilo.nombre}
                {hilo.nombre}
            {/if}
        </span>
    {/if}
</div>

<DialogoReporte bind:visible={mostrarReporte} hiloId={hilo.id} />

<style>
    .acciones {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }

    .mod {
        color: white;
        text-transform: uppercase;
        font-family: sans-serif;
        font-weight: bold;
        background: var(--color4);
        margin-left: auto;
        padding: 6px;
        border-radius: 4px;
        border-top: 2px red solid;
    }
    .adm {
        color: gold;
        text-transform: uppercase;
        font-family: sans-serif;
        font-weight: bold;
        animation: lucesAdmin 10s infinite alternate-reverse;
        margin-left: auto;
        padding: 6px;
        border-radius: 4px;
        border-top: 2px gold solid;
    }
    @keyframes lucesAdmin {
        0% {
            background: #630b57;
        }
        50% {
            background: #800080;
        }
        100% {
            background: #4c2882;
        }
    }
    .dev {
        color: greenyellow;
        text-transform: uppercase;
        font-family: sans-serif;
        font-weight: bold;
        background: black;
        margin-left: auto;
        padding: 6px;
        border-radius: 4px;
        border-top: 2px greenyellow solid;
        font-family: "Courier New", Courier, monospace;
        text-transform: lowercase;
    }
</style>
