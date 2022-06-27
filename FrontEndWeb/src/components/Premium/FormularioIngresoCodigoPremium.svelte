<script>
    import { Button } from "svelte-mui";
    import globalStore from "../../globalStore";
    import RChanClient from "../../RChanClient";
    import ErrorValidacion from "../ErrorValidacion.svelte";
    import Spinner from "../Spinner.svelte";
    import RouzCoins from "./RouzCoins.svelte";

    let cargando = false;
    let cp = "";
    let error = null;
    let exito = null;

    async function ingresarCodigoPremium() {
        cargando = true;
        error = null;
        exito = null;
        try {
            const res = await RChanClient.ingresarCodigoPremium(cp);
            exito = res.data;
            cargando = false;
            cp = "";
        } catch (e) {
            cargando = false;
            error = e.response.data;
        }
    }
</script>

<ErrorValidacion {error} />
<form class="formulario panel" on:submit|preventDefault>
    <h3>Ingresar Código Premium</h3>
    <input id="cp" placeholder="XXXXXXXX" type="text" bind:value={cp} />
    <Button
        color="goldenrod"
        disabled={cargando}
        on:click={ingresarCodigoPremium}
    >
        <Spinner {cargando}>Ingresar</Spinner>
    </Button>
    {#if exito}
        <div class="contenedor-exito">
            {#if exito.tipo == 0}
                {#if $globalStore.usuario.esPremium}
                    <p>Has extendido tu membrecía Premium.</p>
                {:else}
                    <p>Ahora sos un usuario Premium.</p>
                {/if}
                <p>Info del código utilizado:</p>
                <p>Vale por activación de Premium</p>
            {:else}
                <p>
                    Se agregaron <RouzCoins cantidad={exito.cantidad} /> a tu cuenta.
                </p>
                <p>Info del código utilizado:</p>
                <p>Vale por <RouzCoins cantidad={exito.cantidad} /></p>
            {/if}
            <p>Usos restantes: {exito.usos}</p>
            <p>El código expira en {new Date(exito.expiracion)}</p>
        </div>
    {/if}
</form>

<style>
    .contenedor-exito {
        padding: 4px;
        background-color: var(--color7);
        border-radius: 4px;
    }
</style>
