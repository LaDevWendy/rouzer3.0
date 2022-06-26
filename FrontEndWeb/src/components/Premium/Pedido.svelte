<script>
    import { Button, ButtonGroup } from "svelte-mui";
    import config from "../../config";
    import { TipoCP, EstadoPedido } from "../../enums";
    import globalStore from "../../globalStore";
    import { abrir } from "./DialogosPremium.svelte";

    export let p;
    export let propio;

    let comprobante = false;

    async function verComprobante() {
        comprobante = true;
    }

    function retirarPedido() {
        abrir.retirarPedido(p.id);
    }

    function aceptarPedido() {
        abrir.aceptarPedido(p.id);
    }

    function rechazarPedido() {
        abrir.rechazarPedido(p.id);
    }

    let membrecia = config.membrecias.find((m) => m.id == p.paquete);
    let rouzcoins = config.rouzcoins.find((m) => m.id == p.paquete);
</script>

<div class="pedido">
    <p>Fecha: {new Date(p.creacion)}</p>
    {#if p.usuario}
        <p>
            Usuario: <a
                class="userlink"
                href="/Moderacion/HistorialDeUsuario/{p.usuario.id}"
                >{p.usuario.userName}</a
            >
        </p>
    {/if}
    <p>Tipo: {TipoCP.aString(p.tipo)}</p>
    {#if p.tipo == TipoCP.ActivacionPremium}
        <p>
            Paquete: {`${membrecia.cantidad} días +${rouzcoins.cantidad} RouzCoins`}
            {membrecia.valor}
        </p>
    {/if}
    {#if p.tipo == TipoCP.RouzCoins}
        <p>
            Paquete: {`${rouzcoins.cantidad} RouzCoins`}
            {rouzcoins.valor}
        </p>
    {/if}
    <p>
        Método de pago: {config.metodosdepago.find((mp) => mp.id == p.metodo)
            .nombre}
    </p>
    <p>Estado: {EstadoPedido.getField(p.estado).nombre}</p>
    {#if p.codigoMembreciaId}
        <p>
            Código de activación premium: <span class="exito"
                >{p.codigoMembreciaId}</span
            >
        </p>
    {/if}
    {#if p.codigoPaqueteId}
        <p>
            Código para agregar RouzCoins: <span class="exito"
                >{p.codigoPaqueteId}</span
            >
        </p>
    {/if}
    {#if p.estado == EstadoPedido.Rechazado.id}
        <p>
            Contacte por Telegram <a href="tg://resolve?domain=M0rdrake"
                >@M0rdrake</a
            >
            o por e-mail a
            <a href="mailto:rzmp978@gmail.com">rzmp978@gmail.com</a>
        </p>
    {/if}

    <ButtonGroup>
        {#if p.comprobanteId}<Button color="primary" on:click={verComprobante}
                >Ver Comprobante</Button
            >{/if}
        {#if p.estado == EstadoPedido.Pendiente.id && propio}
            <Button color="primary" on:click={retirarPedido}
                >Arrepentimiento</Button
            >{/if}
        {#if p.estado == EstadoPedido.Pendiente.id && $globalStore.usuario.esDirector && !propio}
            <Button color="primary" on:click={aceptarPedido}>Aceptar</Button>
            <Button color="primary" on:click={rechazarPedido}>Rechazar</Button>
        {/if}
    </ButtonGroup>

    {#if comprobante}
        <a target="_blank" href={`/api/Premium/ObtenerComprobante/${p.id}`}>
            <img
                alt="comprobante"
                src={`/api/Premium/ObtenerComprobante/${p.id}`}
            />
        </a>
    {/if}
</div>

<style>
    .pedido {
        background-color: var(--color7);
        border-radius: 4px;
        padding-left: 4px;
        padding-right: 4px;
    }
    .pedido a {
        color: var(--color5);
    }
</style>
