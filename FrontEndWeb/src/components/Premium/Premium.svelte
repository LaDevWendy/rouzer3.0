<script>
    import { Button } from "svelte-mui";
    import RChanClient from "../../RChanClient";
    import ErrorValidacion from "../ErrorValidacion.svelte";
    import Spinner from "../Spinner.svelte";
    import globalStore from "../../globalStore";

    let { balance, transacciones } = window.model;
    console.log(transacciones);

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
        <h3>
            Cuenta: {$globalStore.usuario.esPremium ? "Premium" : "Regular"}
        </h3>
        <h3>Balance: {balance} RouzCoins</h3>
        <h3>Transacciones</h3>
        <ul>
            {#each transacciones as t}
                <li>
                    {t.creacion}
                    {t.tipo}
                    {t.origenCantidad}
                    {t.origenUnidad}
                    {t.destinoCantidad}
                    {t.destinoUnidad}
                    {t.balance}
                </li>
            {/each}
        </ul>
    </section>

    <section>
        <ErrorValidacion {error} />
        <form class="formulario panel" on:submit|preventDefault>
            <label for="cp">Ingresar Código Premium</label>
            <input id="cp" type="text" bind:value={cp} />
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
                    <p>Usos restantes: {exito.usos}</p>
                    <p>El código expira en {exito.expiracion}</p>
                {:else}
                    <p>Se agregaron {exito.cantidad} RouzCoins a tu cuenta.</p>
                    <p>Info del código utilizado:</p>
                    <p>Vale por {exito.cantidad} RouzCoins</p>
                    <p>Usos restantes: {exito.usos}</p>
                    <p>El código expira en {exito.expiracion}</p>
                {/if}
            {/if}
        </form>
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
</style>
