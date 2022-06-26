<script>
    import { TipoTransaccion } from "../../enums";
    export let transacciones;
</script>

<ul>
    {#if transacciones.length == 0}
        No tienes transacciones registradas
    {/if}
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

<style>
    .transaccion {
        background-color: var(--color7);
    }
    .transaccion {
        border-radius: 4px;
        padding-left: 4px;
        padding-right: 4px;
    }
</style>
