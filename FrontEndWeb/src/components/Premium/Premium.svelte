<script>
    import globalStore from "../../globalStore";
    import FormularioMensajeGlobal from "./FormularioMensajeGlobal.svelte";
    import RouzCoins from "./RouzCoins.svelte";
    import FormularioPedidoCodigoPremium from "./FormularioPedidoCodigoPremium.svelte";
    import FormularioIngresoCodigoPremium from "./FormularioIngresoCodigoPremium.svelte";
    import ListaDeTransacciones from "./ListaDeTransacciones.svelte";
    import ListaDePedidos from "./ListaDePedidos.svelte";

    let { balance, pedidos, transacciones, propio } = window.model;
</script>

<div class="row">
    <section>
        <div class="panel cuenta-info">
            <p>
                Cuenta: {$globalStore.usuario.esPremium ? "Premium" : "Regular"}
            </p>
            {#if $globalStore.usuario.esPremium}
                <p>Expiracion: {new Date(balance.expiracion)}</p>
            {/if}
            <p>
                Balance: <RouzCoins cantidad={balance.balance} />
                {$globalStore.usuario.esPremium
                    ? ""
                    : "(Para poder usarlo debes ser premium)"}
            </p>
            <p>
                Por consultas contactar por Telegram <a
                    href="tg://resolve?domain=M0rdrake">@M0rdrake</a
                >
                o por e-mail a
                <a href="mailto:rzmp978@gmail.com">rzmp978@gmail.com</a>
            </p>
        </div>
    </section>

    <section>
        <FormularioPedidoCodigoPremium />
    </section>

    <section><FormularioIngresoCodigoPremium /></section>

    {#if $globalStore.usuario.esPremium}
        <section>
            <FormularioMensajeGlobal />
        </section>
    {/if}
</div>
<div class="row">
    <section>
        <div class="panel">
            <h4>Últimos pedidos</h4>
            <a href="/Mis/Pedidos">Ver todos</a>
            <ListaDePedidos {pedidos} {propio} />
        </div>
    </section>

    <section>
        <div class="panel">
            <h4>Últimas transacciones</h4>
            <a href="/Mis/Transacciones">Ver todas</a>
            <ListaDeTransacciones {transacciones} />
        </div>
    </section>
</div>

<style>
    .row {
        margin-bottom: 10px;
        margin-left: auto;
        margin-right: auto;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        max-width: 1270px;
    }
    .row > section {
        flex: 1;
    }
    section {
        max-width: 400px;
        width: max-content;
        min-width: 270px !important;
    }
    section a {
        color: var(--color5);
    }

    section .panel {
        box-shadow: black 0 0 4px;
    }

    .cuenta-info {
        background-color: var(--color3);
        border-radius: 4px;
        padding-left: 4px;
        padding-right: 4px;
    }
</style>
