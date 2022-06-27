<script context="module">
    import { writable } from "svelte/store";
    import RChanClient from "../../RChanClient";
    import Dialogo from "../Dialogo.svelte";
    import RouzCoins from "./RouzCoins.svelte";
    import config from "../../config";

    const dialogosPremiumStore = writable({
        dialogoAbierto: "ninguno",
        hiloId: "",
        cantidad: -1,
    });

    function abrirDestacar(hiloId) {
        dialogosPremiumStore.update((s) => {
            s.dialogoAbierto = "abrirDestacar";
            s.hiloId = hiloId;
            return s;
        });
    }

    function abrirDonar(hiloId) {
        dialogosPremiumStore.update((s) => {
            s.dialogoAbierto = "abrirDonar";
            s.hiloId = hiloId;
            return s;
        });
    }

    function abrirEliminarMensajeGlobal(id) {
        dialogosPremiumStore.update((s) => {
            s.dialogoAbierto = "abrirEliminarMensajeGlobal";
            s.hiloId = id;
            return s;
        });
    }

    function abrirRetirarPedido(id) {
        dialogosPremiumStore.update((s) => {
            s.dialogoAbierto = "abrirRetirarPedido";
            s.hiloId = id;
            return s;
        });
    }

    function abrirAceptarPedido(id) {
        dialogosPremiumStore.update((s) => {
            s.dialogoAbierto = "abrirAceptarPedido";
            s.hiloId = id;
            return s;
        });
    }

    function abrirRechazarPedido(id) {
        dialogosPremiumStore.update((s) => {
            s.dialogoAbierto = "abrirRechazarPedido";
            s.hiloId = id;
            return s;
        });
    }

    function abrirCanjearRouzCoins() {
        dialogosPremiumStore.update((s) => {
            s.dialogoAbierto = "abrirCanjearRouzCoins";
            return s;
        });
    }

    export const abrir = {
        destacar: abrirDestacar,
        donar: abrirDonar,
        eliminarMensajeGlobal: abrirEliminarMensajeGlobal,
        retirarPedido: abrirRetirarPedido,
        aceptarPedido: abrirAceptarPedido,
        rechazarPedido: abrirRechazarPedido,
        canjearRouzCoins: abrirCanjearRouzCoins,
    };

    let ab = config.autoBumps.find((w) => w.id == 0);
</script>

<Dialogo
    visible={$dialogosPremiumStore.dialogoAbierto == "abrirDestacar"}
    titulo="Destacar"
    accion={() => {
        return RChanClient.autoBumpear($dialogosPremiumStore.hiloId);
    }}
>
    <span slot="activador" />
    <div slot="body">
        <p>
            Bumpeo automático cada 5 minutos durantes {ab.duracion} minutos (<RouzCoins
                cantidad={ab.valor}
            />)
        </p>
    </div>
</Dialogo>

<Dialogo
    visible={$dialogosPremiumStore.dialogoAbierto == "abrirDonar"}
    titulo="Donar"
    accion={() => {
        return RChanClient.hacerDonacion(
            $dialogosPremiumStore.hiloId,
            $dialogosPremiumStore.cantidad
        );
    }}
>
    <span slot="activador" />
    <div slot="body">
        <select bind:value={$dialogosPremiumStore.cantidad} name="cantidad">
            <option value="-1" selected disabled>Cantidad</option>
            <option value="1">1 RouzCoins</option>
            <option value="5">5 RouzCoins</option>
            <option value="10">10 RouzCoins</option>
            <option value="50">50 RouzCoins</option>
            <option value="100">100 RouzCoins</option>
            <option value="500">500 RouzCoins</option>
            <option value="1000">1000 RouzCoins</option>
        </select>
    </div>
</Dialogo>

<Dialogo
    visible={$dialogosPremiumStore.dialogoAbierto ==
        "abrirEliminarMensajeGlobal"}
    titulo="Eliminar"
    accion={() => {
        return RChanClient.eliminarMensajeGlobal($dialogosPremiumStore.hiloId);
    }}
>
    <span slot="activador" />
    <div slot="body">
        <p>Eliminar mensaje global.</p>
        <p style="color: red">
            <i class="fe fe-alert-triangle" /> ESTA ACCIÓN ES IRREVERSIBLE
        </p>
    </div>
</Dialogo>

<Dialogo
    visible={$dialogosPremiumStore.dialogoAbierto == "abrirRetirarPedido"}
    titulo="Retirar"
    accion={() => {
        return RChanClient.retirarPedido($dialogosPremiumStore.hiloId);
    }}
>
    <span slot="activador" />
    <div slot="body">
        <p>Retirar pedido</p>
        <p style="color: red">
            <i class="fe fe-alert-triangle" /> ESTA ACCIÓN ES IRREVERSIBLE
        </p>
        <p>El comprobante será eliminado</p>
    </div>
</Dialogo>

<Dialogo
    visible={$dialogosPremiumStore.dialogoAbierto == "abrirAceptarPedido"}
    titulo="Aceptar"
    accion={() => {
        return RChanClient.aceptarPedido($dialogosPremiumStore.hiloId);
    }}
>
    <span slot="activador" />
    <div slot="body">
        <p>Aceptar pedido</p>
        <p style="color: red">
            <i class="fe fe-alert-triangle" /> ESTA ACCIÓN ES IRREVERSIBLE
        </p>
        <p>El comprobante será eliminado</p>
    </div>
</Dialogo>

<Dialogo
    visible={$dialogosPremiumStore.dialogoAbierto == "abrirRechazarPedido"}
    titulo="Rechazar"
    accion={() => {
        return RChanClient.rechazarPedido($dialogosPremiumStore.hiloId);
    }}
>
    <span slot="activador" />
    <div slot="body">
        <p>Rechazar pedido</p>
        <p style="color: red">
            <i class="fe fe-alert-triangle" /> ESTA ACCIÓN ES IRREVERSIBLE
        </p>
        <p>El comprobante será eliminado</p>
    </div>
</Dialogo>

<Dialogo
    visible={$dialogosPremiumStore.dialogoAbierto == "abrirCanjearRouzCoins"}
    titulo="Canjear RouzCoins"
    accion={() => {
        return RChanClient.canjearRouzCoins();
    }}
>
    <span slot="activador" />
    <div slot="body">
        <p>
            Canjear <RouzCoins
                cantidad={config.canjes.find((c) => c.id == 0).rouzCoins}
            /> por {config.canjes.find((c) => c.id == 0).dias} días de membrecía
            Premium
        </p>
        <p style="color: red">
            <i class="fe fe-alert-triangle" /> ESTA ACCIÓN ES IRREVERSIBLE
        </p>
    </div>
</Dialogo>
