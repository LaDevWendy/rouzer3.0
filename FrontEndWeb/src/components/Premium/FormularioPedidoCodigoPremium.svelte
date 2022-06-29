<script>
    import { Button } from "svelte-mui";
    import ErrorValidacion from "../ErrorValidacion.svelte";
    import Spinner from "../Spinner.svelte";
    import { TipoCP } from "../../enums";
    import RChanClient from "../../RChanClient";
    import config from "../../config";
    import { linksDePago } from "../../linksdepago";

    let tipocp = -1;
    let paquete = -1;
    let metodo = -1;
    let input = null;
    let archivoBlob = null;
    let error = null;
    let cargando = false;
    let exito;

    async function getBlobFromInput(input) {
        return new Promise((resolve, reject) => {
            if (!(input.files && input.files[0])) return null;
            let blob;
            let reader = new FileReader();
            reader.onload = function (e) {
                blob = e.target.result;
                resolve(blob);
            };
            reader.readAsDataURL(input.files[0]);
        });
    }

    async function actualizarArchivo() {
        if (input.files && input.files[0]) {
            if (input.files[0].type.indexOf("image") != -1) {
                archivoBlob = await getBlobFromInput(input);
            } else {
                archivoBlob = null;
                input.value = "";
            }
        }
    }

    async function pedirCodigoPremium() {
        cargando = true;
        error = null;
        exito = null;
        let comprobante = null;
        if (input && input.files) {
            comprobante = input.files[0];
        }
        try {
            const res = await RChanClient.pedirCodigoPremium(
                tipocp,
                paquete,
                metodo,
                comprobante
            );
            exito = res.data;
            cargando = false;
            tipocp = -1;
            paquete = -1;
            metodo = -1;
            input = null;
            archivoBlob = null;
        } catch (e) {
            cargando = false;
            error = e.response.data;
        }
    }
</script>

<ErrorValidacion {error} />
<form class="formulario panel" on:submit|preventDefault>
    <h3>Pedido de código premium</h3>
    <select id="tipo-cp" bind:value={tipocp}>
        <option value="-1" selected disabled>Tipo</option>
        {#each Object.keys(TipoCP) as tcp}
            <option value={TipoCP[tcp]}>{tcp}</option>
        {/each}
    </select>
    {#if tipocp == TipoCP.ActivacionPremium}
        <select id="tipo-membrecia" bind:value={paquete}>
            <option value="-1" selected disabled>Membrecía</option>
            {#each config.membrecias as mem}
                <option value={mem.id}
                    >{`${mem.cantidad} días +${
                        config.rouzcoins.find((rc) => rc.id == mem.id).cantidad
                    } RouzCoins`}
                    {mem.valor}</option
                >
            {/each}
        </select>
    {/if}
    {#if tipocp == TipoCP.RouzCoins}
        <select id="tipo-paqueterc" bind:value={paquete}>
            <option value="-1" selected disabled>Paquete RouzCoinz</option>
            {#each config.rouzcoins as prc}
                <option value={prc.id}
                    >{`${prc.cantidad} RouzCoins`}
                    {prc.valor}</option
                >
            {/each}
        </select>
        <p style="color: red">
            <i class="fe fe-alert-triangle" /> Recuerda que para cargar RouzCoins
            debes ser miembro Premium
        </p>
    {/if}

    {#if tipocp != -1 && paquete != -1}
        <select id="tipo-metodo" bind:value={metodo}>
            <option value="-1" selected disabled>Método de pago</option>
            {#each config.metodosdepago as met}
                <option value={met.id}>{met.nombre}</option>
            {/each}
        </select>
    {/if}

    {#if tipocp != -1 && paquete != -1 && metodo != -1}
        {#if metodo != 2 && metodo != 3 && metodo != 4}
            <a
                class="link-de-pago"
                href={linksDePago.find(
                    (l) =>
                        l.TipoId == tipocp &&
                        l.PaqueteId == paquete &&
                        l.MetodoId == metodo
                ).Link}
                target="_blank">Link de pago</a
            >
        {:else}
            <div class="contenedor-direccion">
                {linksDePago.find(
                    (l) =>
                        l.TipoId == tipocp &&
                        l.PaqueteId == paquete &&
                        l.MetodoId == metodo
                ).Link}
            </div>
        {/if}
        <div class="contenedor-comprobante">
            <label for="archivo"
                >Adjuntar captura de comprobante de pago (jpg, png)</label
            >
            <input
                id="archivo"
                name="archivo"
                on:change={actualizarArchivo}
                type="file"
                bind:this={input}
            />
            <div class="archivo">
                <img
                    class="archivo"
                    alt="archivo"
                    src={archivoBlob ? archivoBlob : "/imagenes/rose2.jpg"}
                />
            </div>
        </div>
    {/if}

    <Button color="goldenrod" disabled={cargando} on:click={pedirCodigoPremium}>
        <Spinner {cargando}>Pedir</Spinner>
    </Button>

    {#if exito}
        <p class="exito">{exito.mensaje}</p>
    {/if}
</form>

<style>
    .archivo {
        max-height: 300px;
        width: 100%;
    }
    .link-de-pago {
        color: var(--color5);
        margin-top: 10px;
        margin-bottom: 10px;
        margin-left: auto;
        margin-right: auto;
        font-size: 1.5rem;
    }
    .contenedor-direccion {
        overflow-wrap: break-word;
    }
    .contenedor-comprobante,
    .contenedor-direccion {
        padding: 4px;
        background-color: var(--color7);
        border-radius: 4px;
        margin-top: 4px;
        margin-bottom: 4px;
    }
</style>
