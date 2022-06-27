<script>
    import { Button } from "svelte-mui";
    import RChanClient from "../../RChanClient";
    import ErrorValidacion from "../ErrorValidacion.svelte";
    import Spinner from "../Spinner.svelte";
    import config from "../../config";

    let cargando = false;
    let mg = "";
    let error = null;
    let exito = null;
    let tier;

    async function crearMensajeGlobal() {
        cargando = true;
        error = null;
        exito = null;
        try {
            const res = await RChanClient.crearMensajeGlobal(mg, tier);
            exito = res.data;
            cargando = false;
            mg = "";
        } catch (e) {
            cargando = false;
            error = e.response.data;
        }
    }

    let wares = config.mensajesGlobales;

    function parsearDuracion(duracion) {
        if (duracion < 60) {
            return `${duracion} min`;
        }

        if (duracion < 1440) {
            return `${duracion / 60} hora${duracion == 60 ? "" : "s"}`;
        }
        return `${duracion / 1440} día${duracion == 1440 ? "" : "s"}`;
    }
</script>

<ErrorValidacion {error} />
<form class="formulario panel" on:submit|preventDefault>
    <h3>Crear Mensaje Global</h3>
    <textarea id="mg" placeholder="Mensaje" bind:value={mg} />
    <select bind:value={tier}>
        <option value="-1" selected disabled>Duración</option>
        {#each wares as w}
            <option value={w.id}
                >{parsearDuracion(w.duracion)} ({w.valor} RouzCoins)</option
            >
        {/each}
    </select>
    <Button color="primary" disabled={cargando} on:click={crearMensajeGlobal}>
        <Spinner {cargando}>Crear</Spinner>
    </Button>
    {#if exito}
        <p class="exito">{exito.mensaje}</p>
    {/if}
</form>
