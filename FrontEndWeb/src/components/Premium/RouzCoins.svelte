<script>
    export let cantidad;
</script>

<span class="rouzcoin-contenido">
    {cantidad}<span title="RouzCoins" class="rouzcoin-simbolo">R</span>
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
