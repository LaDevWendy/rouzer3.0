<script>
    import { Button } from "svelte-mui";
    import RChanClient from "../../RChanClient";
    import ErrorValidacion from "../ErrorValidacion.svelte";
    import Spinner from "../Spinner.svelte";
    import globalStore from "../../globalStore";
    import { TipoTransaccion } from "../../enums";
    import FormularioMensajeGlobal from "./FormularioMensajeGlobal.svelte";
    import RouzCoins from "./RouzCoins.svelte";

    let { balance, transacciones } = window.model;

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

<main>
    <section>
        <ErrorValidacion {error} />
        <form class="formulario panel" on:submit|preventDefault>
            <h3>Ingresar Código Premium</h3>
            <input id="cp" placeholder="XXXXXXXX" type="text" bind:value={cp} />
            <Button
                color="primary"
                disabled={cargando}
                on:click={ingresarCodigoPremium}
            >
                <Spinner {cargando}>Ingresar</Spinner>
            </Button>
            {#if exito}
                {#if exito.tipo == 0}
                    <p>Ahora sos un usuario Premium.</p>
                    <p>Info del código utilizado:</p>
                    <p>Vale por activación de Premium</p>
                {:else}
                    <p>
                        Se agregaron <RouzCoins cantidad={exito.cantidad} /> a tu
                        cuenta.
                    </p>
                    <p>Info del código utilizado:</p>
                    <p>Vale por <RouzCoins cantidad={exito.cantidad} /></p>
                {/if}
                <p>Usos restantes: {exito.usos}</p>
                <p>El código expira en {new Date(exito.expiracion)}</p>
            {/if}
        </form>
    </section>

    {#if $globalStore.usuario.esPremium}
        <section>
            <FormularioMensajeGlobal />
        </section>
    {/if}

    <section class="panel">
        <div class="cuenta-info">
            <p>
                Cuenta: {$globalStore.usuario.esPremium ? "Premium" : "Regular"}
            </p>
            {#if $globalStore.usuario.esPremium}
                <p>Expiracion: {new Date(balance.expiracion)}</p>
            {/if}
            <p>Balance: <RouzCoins cantidad={balance.balance} /></p>
        </div>
        <ul>
            <h4>Últimas transacciones</h4>
            {#each transacciones as t}
                <li class="transaccion">
                    <p>Fecha: {new Date(t.creacion)}</p>
                    <p>Tipo: {TipoTransaccion.aString(t.tipo)}</p>
                    <p>Origen cantidad: {t.origenCantidad} {t.origenUnidad}</p>
                    <p>
                        Destino cantidad: {t.destinoCantidad}
                        {t.destinoUnidad}
                    </p>
                    {#if t.balance > -1}
                        <p>Balance: {t.balance}</p>
                    {/if}
                </li>
            {/each}
        </ul>
    </section>
</main>

<style>
    main {
        margin: auto;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        max-width: 1270px;
        margin: auto;
    }
    main > section {
        flex: 1;
    }
    section {
        max-width: 400px;
        width: max-content;
        min-width: 270px !important;
    }

    .cuenta-info {
        background-color: var(--color3);
    }
    .transaccion {
        background-color: var(--color7);
    }
    .transaccion,
    .cuenta-info {
        border-radius: 4px;
        padding-left: 4px;
        padding-right: 4px;
    }
</style>
