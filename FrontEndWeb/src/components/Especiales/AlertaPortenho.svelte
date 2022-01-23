<script>
    import { configStore } from "../../config";
    import { onDestroy } from "svelte";
    let activado = false;

    $: activado = $configStore.general.flags.includes("portenho");

    let sonido = new Audio("/audio/portenho.mp3");
    sonido.loop = true;

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
        sonido.volume = activado && !document[hidden];
    }

    $: sonido.volume = activado && !document[hidden];

    $: if (activado) {
        try {
            sonido.play();
            onDestroy(() => sonido.stop());
        } catch (error) {
            console.log(error);
        }

        document.getElementById("portenho").innerHTML = `
body{
    --color1:#ff91af!important;
    --color2:#e75480!important;
    --color3:#e75480!important;
    --color4:#c20073!important;
    --color5:pink!important;
    --color7:#d74894!important;
    --color8:#893843!important;
    --color9:#e4717a!important;
}
#fondo-global{
     background: linear-gradient(to right, var(--color2), var(--color2)), url(/imagenes/rosed.png);
     background-blend-mode: color, normal;
}
 .menu-principal-header{
     background: linear-gradient(to right, var(--color2), var(--color2)), url(/imagenes/rose2.jpg);
     background-blend-mode: color, normal;
     background-position-y: -100px;
     background-size: cover;
}
 .image-preview, .video-preview{
     background: linear-gradient(to right, var(--color2), var(--color2)), url(/imagenes/rose2.jpg) !important;
     background-blend-mode: color, normal;
}
.hilo>.hilo-in::after,.media::after{
    content:"";
    background:url(/imagenes/portenho.gif);
    background-size:cover;
    top:0;
    left:0;
    width:100%;
    height:100%;
    position:absolute
}
.media::after{
     animation: porteno2 15s;
     animation-iteration-count:infinite;
}
.hilo-in::after{
    opacity:0
}
.hilo-in{
    border:1px solid var(--color5)
}
.hilo-in,.media,.nav-categorias,.panel,li>.comentario{
    animation-name:shake;
    animation-duration:.82s;
    animation-iteration-count:infinite
}
.hilo:nth-child(4n+1)>.hilo-in,li:nth-child(2n)>.comentario{
    animation-delay:.2s
}
.hilo:nth-child(4n+2)>.hilo-in{
    animation-delay:.6s
}
.hilo:nth-child(4n+3)>.hilo-in{
    animation-delay:.4s
}
.panel{
    animation-delay:.4s
}
.nav-categorias{
    animation-delay:.5s
}
.hilo>.hilo-in::after{
    animation:porteno1 7.5s, porteno2 15s;
    animation-iteration-count:infinite
}
.hilo:nth-child(4n+1)>.hilo-in::after{
    animation-delay:1.875s
}
.hilo:nth-child(4n+2)>.hilo-in::after{
    animation-delay:3.75s
}
.hilo:nth-child(4n+3)>.hilo-in::after{
    animation-delay:5.625s
}
.hilo>.hilo-in:hover::after,.media:hover::after{
    opacity:0!important;
    z-index:-10
}
@keyframes porteno1{
    0%,10%,100%,90%{
        opacity:0
    }
    40%,60%{
        opacity:1
    }
}
@keyframes porteno2{
     0%{
         background-position: left;
    }
     50%{
         background-position: right;
    }
}
@keyframes shake{
    10%,90%{
        transform:translate3d(-1px,0,0)
    }
    20%,80%{
        transform:translate3d(2px,0,0)
    }
    30%,50%,70%{
        transform:translate3d(-4px,0,0)
    }
    40%,60%{
        transform:translate3d(4px,0,0)
    }
}        
        `;
    } else {
        document.getElementById("portenho").innerHTML = ``;
    }
</script>

<style></style>
