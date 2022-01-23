<script>
    import { configStore } from "../../config";
    import { onDestroy } from "svelte";
    let activado = false;

    $: activado = $configStore.general.flags.includes("nenazo");

    let sonido1 = new Audio("/audio/nenazo.mp3");
    let sonido2 = new Audio("/audio/ilarie.mp3");
    sonido1.loop = true;
    sonido2.loop = true;

    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    document.addEventListener(visibilityChange, handleVisibilityChange, false);

    function handleVisibilityChange() {
        sonido1.volume = activado && !document[hidden];
        sonido2.volume = activado && !document[hidden];
    }

    $: sonido1.volume = activado && !document[hidden];
    $: sonido2.volume = activado && !document[hidden];

    $: if (activado) {
        try {
            sonido1.play();
            sonido2.play();
            onDestroy(() => {
                sonido1.stop();
                sonido2.stop();
            });
        } catch (error) {
            console.log(error);
        }

        document.getElementById(
            "nenazo"
        ).innerHTML = `body{--color1:#51d1f6;--color2:#51d1f6;--color3:#6fbbd3;--color4:#6fbbd3;--color5:#add8e6;--color6:#ff4000;--color7:#d1ebf7;--color8:#b3d5e0;--color9:#2a6478;--color-texto1:#18171c;--color-texto2:var(--color-texto1);--primary:var(--color-texto1)}#fondo-global,.image-preview,.menu-principal-header,.video-preview{filter:brightness(3) hue-rotate(-23deg)}.hilo>.hilo-in::after,.media::after{content:"";background:url(/imagenes/nenazo.gif);background-size:contain;top:0;left:0;width:100%;height:100%;position:absolute}.hilo-in::after{opacity:0}.hilo-in{border:1px solid var(--color5)}.hilo-in,.media,.nav-categorias,.panel,li>.comentario{animation-name:shake;animation-duration:.82s;animation-iteration-count:infinite}.hilo:nth-child(4n+1)>.hilo-in,li:nth-child(2n)>.comentario{animation-delay:.2s}.hilo:nth-child(4n+2)>.hilo-in{animation-delay:.6s}.hilo:nth-child(4n+3)>.hilo-in{animation-delay:.4s}.panel{animation-delay:.4s}.nav-categorias{animation-delay:.5s}.hilo>.hilo-in::after{animation-duration:7.5s;animation-name:nenazo1;animation-iteration-count:infinite}.hilo:nth-child(4n+1)>.hilo-in::after{animation-delay:1.875s}.hilo:nth-child(4n+2)>.hilo-in::after{animation-delay:3.75s}.hilo:nth-child(4n+3)>.hilo-in::after{animation-delay:5.625s}.hilo>.hilo-in:hover::after,.media:hover::after{opacity:0!important;z-index:-10}@keyframes nenazo1{0%,10%,100%,90%{opacity:0}40%,60%{opacity:1}}@keyframes shake{10%,90%{transform:translate3d(-1px,0,0)}20%,80%{transform:translate3d(2px,0,0)}30%,50%,70%{transform:translate3d(-4px,0,0)}40%,60%{transform:translate3d(4px,0,0)}}`;
    } else {
        document.getElementById("nenazo").innerHTML = ``;
    }
</script>

<style></style>
