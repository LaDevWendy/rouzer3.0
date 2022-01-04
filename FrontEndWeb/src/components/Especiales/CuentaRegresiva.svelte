<script>
    import { cuentaRegresivaStore } from "./CuentaRegresivaStore";

    let dias = 0;
    let horas = 0;
    let minutos = 0;
    let segundos = 0;

    // let futureDate = new Date(new Date().getTime() + 5000)
    // let fechaFutura = new Date("Dec 31 2020 19:13:00")
    // let fechaActual = new Date();
    let reproduciendoSoleado = false;

    // let soleado  = new Audio("/audio/soleado.mp3")
    let countDown = () => {
        $cuentaRegresivaStore.fechaActual = new Date();
        let myDate =
            $cuentaRegresivaStore.fechaFutura -
            $cuentaRegresivaStore.fechaActual;

        dias = Math.floor(myDate / 1000 / 60 / 60 / 24);
        horas = Math.floor(myDate / 1000 / 60 / 60) % 24;
        minutos = Math.floor(myDate / 1000 / 60) % 60;
        segundos = Math.floor(myDate / 1000) % 60;

        // if($cuentaRegresivaStore.fechaFutura < $cuentaRegresivaStore.fechaActual && !reproduciendoSoleado) {
        //     soleado.currentTime = ($cuentaRegresivaStore.fechaActual.getTime() - $cuentaRegresivaStore.fechaFutura.getTime()) / 1000
        //     try {
        //         soleado.play()
        //     } catch(e) {
        //         console.log(e);
        //     }
        //     reproduciendoSoleado = true;

        // }
    };

    countDown();

    setInterval(countDown, 1000);
</script>

<div class="cuenta-regresiva">
    {#if $cuentaRegresivaStore.fechaFutura > $cuentaRegresivaStore.fechaActual}
        <span>Contacto en</span>
        <div class="countdown-container">
            {#if dias > 0}
                <span id="days" class="big-text">{dias}</span>
                <span>Día{dias != 1 ? "s" : ""}</span>
            {/if}
            {#if horas > 0}
                <span id="hours" class="big-text">{horas}</span>
                <span>Hora{horas != 1 ? "s" : ""}</span>
            {/if}
            {#if minutos > 0}
                <span id="min" class="big-text">{minutos}</span>
                <span>Minuto{minutos != 1 ? "s" : ""}</span>
            {/if}
            <span id="sec" class="big-text">{segundos}</span>
            <span>Segundo{segundos != 1 ? "s" : ""}</span>
        </div>
    {:else}
        <!-- <div>Feliz dia 100</div> -->
        <div class="msg">2022</div>
    {/if}
</div>

<style>
    .cuenta-regresiva {
        font-family: "euroFighter";
        font-size: 20px;
        color: gold;
        text-align: center;
        position: absolute;
        padding-top: 4px;
        width: 100%;
        pointer-events: none !important;
        z-index: 1;
    }
    .msg {
        top: 15px;
        position: relative;
    }

    @media (max-width: 600px) {
        .cuenta-regresiva {
            font-size: 6px !important;
            height: 100%;
        }
        :global(.modoSticky) :global(.cuenta-regresiva) {
            font-size: 4px !important;
        }
        .msg {
            font-size: 10px;
            top: 70%;
        }
    }
    :global(.modoSticky) .cuenta-regresiva {
        font-size: 13px;
    }
</style>