<script>
    import RChanClient from "../../RChanClient";
    import ErrorValidacion from "../ErrorValidacion.svelte";
    import Spinner from "../Spinner.svelte";
    import { TipoAccionCP, TipoCP } from "../../enums";
    import { Button } from "svelte-mui";

    let ccp;
    let error = null;
    let cargando = false;
    let codigoPremiumCheckeado;
    let historialcp;
    async function checkear() {
        cargando = true;
        error = null;
        try {
            const res = await RChanClient.checkearCodigoPremium(ccp);
            cargando = false;
            codigoPremiumCheckeado = res.data.cp;
            historialcp = res.data.historial;
        } catch (e) {
            cargando = false;
            error = e.response.data;
        }
    }
</script>

<h3>Checkear Código Premium</h3>
<ErrorValidacion {error} />
<form class="formulario panel" on:submit|preventDefault>
    <input type="text" placeholder="XXXXXXXX" bind:value={ccp} />
    <Button color="primary" disabled={cargando} on:click={checkear}>
        <Spinner {cargando}>Checkear</Spinner>
    </Button>
    {#if codigoPremiumCheckeado}
        <div class="codigo-info">
            <p>
                Tipo: {TipoCP.aString(codigoPremiumCheckeado.tipo)}
            </p>
            <p>Cantidad: {codigoPremiumCheckeado.cantidad}</p>
            <p>Usos: {codigoPremiumCheckeado.usos}</p>
            <p>
                Expiración: {new Date(codigoPremiumCheckeado.expiracion)}
            </p>
        </div>
    {/if}
    {#if historialcp}
        <ul>
            <h4>Historial del código</h4>
            {#each historialcp as acp}
                <li class="accion">
                    <p>Fecha: {new Date(acp.creacion)}</p>
                    <p>
                        Usuario: <a
                            class="userlink"
                            href="/Moderacion/HistorialDeUsuario/{acp.usuario
                                .id}">{acp.usuario.userName}</a
                        >
                    </p>
                    <p>Tipo: {TipoAccionCP.aString(acp.tipo)}</p>
                </li>
            {/each}
        </ul>
    {/if}
</form>

<style>
    .codigo-info {
        background-color: var(--color3);
    }
    .accion {
        background-color: var(--color7);
    }
    .accion,
    .codigo-info {
        border-radius: 4px;
        padding-left: 4px;
        padding-right: 4px;
    }
</style>
