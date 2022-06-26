<script>
    import RChanClient from "../../RChanClient";
    import ErrorValidacion from "../ErrorValidacion.svelte";
    import { TipoCP } from "../../enums";
    import { Button } from "svelte-mui";
    import Spinner from "../Spinner.svelte";

    let tipocp;
    let cantidad = 1;
    let usos = 1;
    let expiracion;
    let cargando = false;
    let codigoPremium;

    let error = null;
    async function crear() {
        cargando = true;
        error = null;
        try {
            const res = await RChanClient.crearCodigoPremium(
                tipocp,
                cantidad,
                usos,
                expiracion
            );
            codigoPremium = res.data.cp;
            cargando = false;
            tipocp = -1;
            cantidad = 1;
            usos = 1;
            expiracion = null;
        } catch (e) {
            cargando = false;
            error = e.response.data;
        }
    }
</script>

<h3>Creacion Código Premium</h3>
<ErrorValidacion {error} />
<form class="formulario panel" on:submit|preventDefault>
    <select id="tipocp" bind:value={tipocp}>
        <option value="-1" selected disabled>Tipo</option>
        {#each Object.keys(TipoCP) as tcp}
            <option value={TipoCP[tcp]}>{tcp}</option>
        {/each}
    </select>
    <label for="cantidad"> Cantidad: </label>
    <input id="cantidad" type="number" min="1" step="1" bind:value={cantidad} />
    <label for="usos"> Usos: </label>
    <input id="usos" type="number" min="1" step="1" bind:value={usos} />
    <label for="expiracion"> Expiración: </label>
    <input type="date" id="expiracion" bind:value={expiracion} />
    <Button color="primary" disabled={cargando} on:click={crear}>
        <Spinner {cargando}>Crear</Spinner>
    </Button>
    {#if codigoPremium}
        <p class="exito">{codigoPremium}</p>
    {/if}
</form>
