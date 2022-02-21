<script>
    import { configStore } from "../../config";
    import { onDestroy } from "svelte";
    let activado = false;

    $: activado = $configStore.general.flags.includes("zoe");

    let sonido1 = new Audio("/audio/zoe.mp3");
    sonido1.loop = true;

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
    }

    $: sonido1.volume = activado && !document[hidden];

    $: if (activado) {
        try {
            sonido1.play();
            onDestroy(() => {
                sonido1.stop();
            });
        } catch (error) {
            console.log(error);
        }

        document.getElementById("zoe").innerHTML = `
body{
     --color1:#103f79;
     --color2:#103f79;
     --color3:#144f97;
     --color4:#033e86;
     --color5:#f3b229;
     --color6:#ff4000;
     --color7:#483d8b;
     --color8:#103f79;
     --color9:#103f79;
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
    background:url(/imagenes/zoe1.jpg);
    background-size: 100% 100%;
    top:0;
    left:0;
    width:100%;
    height:100%;
    position:absolute
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
.hilo>.hilo-in::after, .media::after{
    animation: zoe3 20s;
    animation-iteration-count:infinite;
    animation-timing-function: linear;
}
.hilo:nth-child(5n+1)>.hilo-in::after{
    animation-delay:2s
}
.hilo:nth-child(5n+2)>.hilo-in::after{
    animation-delay:6.6s
}
.hilo:nth-child(5n+3)>.hilo-in::after{
    animation-delay:8.6s
}
.hilo:nth-child(5n+4)>.hilo-in::after{
    animation-delay:10.6s
}
.hilo>.hilo-in:hover::after,.media:hover::after{
    opacity:0!important;
    z-index:-10
}
@keyframes zoe3{
    0%{
        background:url(/imagenes/zoe1.jpg);
        background-size: 100% 100%;
        opacity: 1;
    }
    5%{
        background:url(/imagenes/zoe1.jpg);
        background-size: 100% 100%;
        opacity: 1;
    }
    9%{
        background:url(/imagenes/zoe1.jpg);
        background-size: 100% 100%;
        opacity: 0;
    }
    11%{
        background:url(/imagenes/zoe2.jpg);
        background-size: auto 100%;
        background-position: left;
        opacity: 0;
    }
    20%{
        background:url(/imagenes/zoe2.jpg);
        background-size: auto 100%;
        background-position: left;
        opacity: 1;
    }
    25%{
        background:url(/imagenes/zoe2.jpg);
        background-size: auto 100%;
        background-position: center;
        opacity: 1;
    }
    30%{
        background:url(/imagenes/zoe2.jpg);
        background-size: auto 100%;
        background-position: right;
        opacity: 1;
    }
    34%{
        background:url(/imagenes/zoe2.jpg);
        background-size: auto 100%;
        background-position: right;
        opacity: 0;
    }
    36%{
        background:url(/imagenes/zoe3.jpg);
        background-size: 100% 100%;
        opacity: 0;
    }
    45%{
        background:url(/imagenes/zoe3.jpg);
        background-size: 100% 100%;
        opacity: 1;
    }
    50%{
        background:url(/imagenes/zoe3.jpg);
        background-size: 100% 100%;
        opacity: 1;
    }
    54%{
        background:url(/imagenes/zoe3.jpg);
        background-size: 100% 100%;
        opacity: 0;
    }
    56%{
        background:url(/imagenes/zoe4.jpg);
        background-size: 100% 100%;
        opacity: 0;
    }
    65%{
        background:url(/imagenes/zoe4.jpg);
        background-size: 100% 100%;
        opacity: 1;
    }
    70%{
        background:url(/imagenes/zoe4.jpg);
        background-size: 100% 100%;
        opacity: 1;
    }
    74%{
        background:url(/imagenes/zoe4.jpg);
        background-size: 100% 100%;
        opacity: 0;
    }
    76%{
        background:url(/imagenes/zoe5.jpg);
        background-size: 100% 100%;
        opacity: 0;
    }
    85%{
        background:url(/imagenes/zoe5.jpg);
        background-size: 100% 100%;
        opacity: 1;
    }
    90%{
        background:url(/imagenes/zoe5.jpg);
        background-size: 100% 100%;
        opacity: 1;
    }
    94%{
        background:url(/imagenes/zoe5.jpg);
        background-size: 100% 100%;
        opacity: 0;
    }
    96%{
        background:url(/imagenes/zoe1.jpg);
        background-size: 100% 100%;
        opacity: 0;
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
        document.getElementById("zoe").innerHTML = ``;
    }
</script>

<style></style>
