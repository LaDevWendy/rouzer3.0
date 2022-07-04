<script>
    export let cantidad;
    let c = cantidad;
    if (cantidad != "") {
        c = Math.round(cantidad * 10) / 10;
    }
</script>

<span class="rouzcoin-contenido" title={cantidad}>
    {c}<span title="RouzCoins" class="rouzcoin-simbolo">R</span>
</span>

<style>
    .rouzcoin-contenido {
        color: goldenrod;
    }

    .rouzcoin-simbolo {
        font-family: euroFighter, sans-serif;
        text-align: center;
        position: relative;
    }

    .rouzcoin-simbolo::before {
        position: absolute;
        content: "";
        left: 0.25em;
        top: 0;
        height: 100%;
        width: 0.075em;
        border-left: 0.05em goldenrod solid;
        border-right: 0.05em goldenrod solid;
    }
</style>
