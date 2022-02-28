<script>
  import { configStore } from "../../config";
  let activated = false;

  $: activated = $configStore.general.flags.includes("corte");

  $: if (activated) {
    document.getElementById("corte").innerHTML = `
body {
  --color1: rgb(8, 8, 8);
  --color2: rgb(16 16 16);
  --color3: rgb(32 32 32);
  --color4: rgb(64 64 64);
  --color5: #c2671f;
  --color6: #fc9208;
  --color7: rgb(80 80 80);
  --color8: rgb(96 96 96);
  --color9: rgb(48 48 48);
  background-color: var(--color2);
}

#fondo-global {
  background: black !important;
}

.menu-principal-header {
  background: linear-gradient(to right, var(--color2), var(--color2)),
    url(/imagenes/rose2.jpg);
  background-blend-mode: color, normal;
  background-position-y: -100px;
  background-size: cover;
}

.image-preview,
.video-preview {
  background: linear-gradient(to right, var(--color2), var(--color2)),
    url(/imagenes/rose2.jpg) !important;
  background-blend-mode: color, normal;
}

.hilo > .hilo-in {
  box-shadow: 1px 1px 2px 2px var(--color5);
  animation-name: blink2;
  animation-duration: 10s;
  animation-iteration-count: infinite;
  animation-fill-mode: backwards;
}

.hilo {
  animation-name: blink1;
  animation-duration: 10s;
  animation-iteration-count: infinite;
  animation-fill-mode: backwards;
}

@keyframes blink1 {
  0% {
    filter: brightness(0);
  }

  12.5% {
    filter: brightness(0.5);
  }

  25% {
    filter: brightness(0);
  }
  100% {
    filter: brightness(0);
  }
}

@keyframes blink2 {
  0% {
    box-shadow: 0 0 0px 0px var(--color5);
  }

  12.5% {
    box-shadow: 1px 1px 2px 2px var(--color5);
  }

  25% {
    box-shadow: 0 0 0px 0px var(--color5);
  }
  100% {
    box-shadow: 0 0 0px 0px var(--color5);
  }
}

.hilo:nth-child(5n + 1),
.hilo:nth-child(5n + 1) > .hilo-in {
  animation-delay: 2s;
}

.hilo:nth-child(5n + 2),
.hilo:nth-child(5n + 2) > .hilo-in {
  animation-delay: 4s;
}

.hilo:nth-child(5n + 3),
.hilo:nth-child(5n + 3) > .hilo-in {
  animation-delay: 6s;
}

.hilo:nth-child(5n + 4),
.hilo:nth-child(5n + 4) > .hilo-in {
  animation-delay: 8s;
}

.comentario::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-size: cover;
  background: radial-gradient(farthest-side at 30px 30px, #00000000, #000000ff);
}

.media > a::before,
.media > img::before,
.hilo > .hilo-in::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-size: cover;
  background: radial-gradient(farthest-side at 80% 70%, #00000000, #000000ff);
}

.media > a::after,
.media > img::after,
.hilo > .hilo-in::after {
  content: "";
  background: url(/imagenes/vela.png);
  background-size: cover;
  top: 70%;
  right: 0%;
  width: 20%;
  height: 20%;
  position: absolute;
  opacity: 0.9;
  background-size: 100%;
  background-repeat: no-repeat;
}

.comentario:hover,
.comentario:hover > .contenido > .media,
.comentario:hover > .contenido > .media > a,
.comentario:hover > .contenido > .media > img,
.hilo > .hilo-in:hover,
.media:hover {
  animation: 0;
  box-shadow: 0 0 0px 0px var(--color5) !important;
}
.comentario:hover,
.comentario:hover > .contenido > .media,
.comentario:hover > .contenido > .media > a,
.comentario:hover > .contenido > .media > img,
.hilo:hover,
.media > a:hover,
.media > img:hover {
  animation: 0;
  filter: brightness(1) !important;
}
.comentario:hover::before {
  display: none;
}

.comentario:hover > .contenido > .media > a::before,
.comentario:hover > .contenido > .media > img::before,
.hilo > .hilo-in:hover::before,
.media > a:hover::before,
.media > img:hover::before {
  background: radial-gradient(#00000000, #000000ff);
}

.comentario:hover > .contenido > .media > a::after,
.comentario:hover > .contenido > .media > img::after,
.hilo > .hilo-in:hover::after,
.media > a:hover::after,
.media > img:hover::after {
  display: none;
}

.media > a,
.media > img {
  animation-name: blink3;
  animation-duration: 5s;
  animation-iteration-count: infinite;
  animation-fill-mode: backwards;
}

.media {
  animation-name: blink4;
  animation-duration: 5s;
  animation-iteration-count: infinite;
  animation-fill-mode: backwards;
}

@keyframes blink3 {
  0% {
    filter: brightness(0);
  }

  50% {
    filter: brightness(0.5);
  }
  100% {
    filter: brightness(0);
  }
}

@keyframes blink4 {
  0% {
    box-shadow: 0 0 0px 0px var(--color5);
  }

  50% {
    box-shadow: 1px 1px 2px 2px var(--color5);
  }
  100% {
    box-shadow: 0 0 0px 0px var(--color5);
  }
}

@keyframes blink5 {
  0% {
    filter: brightness(0);
  }

  50% {
    filter: brightness(1);
  }
  100% {
    filter: brightness(0);
  }
}

@keyframes blink6 {
  0% {
    border-top: solid var(--color2) 2px;
  }
  50% {
    border-top: solid var(--color5) 2px;
  }
  100% {
    border-top: solid var(--color2) 2px;
  }
}

#svelte-navbar header nav .nav-principal {
  animation-name: blink6;
  animation-duration: 5s;
  animation-iteration-count: infinite;
  animation-fill-mode: backwards;
  background: url(/imagenes/velas.png) !important;
  background-size: auto 300% !important;
  background-position: 0% 45% !important;
}

.nav-botones,
.rozed,
.version,
.nav-principal .fe-menu {
  border-radius: 4px;
  background-color: var(--color2);
}

.crear-hilo-boton {
  animation-name: blink5;
  animation-duration: 5s;
  animation-iteration-count: infinite;
  animation-fill-mode: backwards;
}

.hilo-preview-mod > .hilo,
a > div > .comentario,
a > div > .comentario > .contenido > .media > a,
a > div > .comentario > .contenido > .media > img,
ul > div > .comentario,
ul > div > .comentario > .contenido > .media > a,
ul > div > .comentario > .contenido > .media > img,
.modoCuadrado > a,
.modoCuadrado > img {
  cursor: auto;
  filter: brightness(1) !important;
}

.hilo-preview-mod > .hilo > .hilo-in,
a > div > .comentario > .contenido > .media,
ul > div > .comentario > .contenido > .media,
.modoCuadrado > a,
.modoCuadrado > img {
  cursor: auto;
  box-shadow: none !important;
}

.media.modoCuadrado {
  animation: 0;
}

.hilo-preview-mod > .hilo > .hilo-in::before,
.hilo-preview-mod > .hilo > .hilo-in::after,
a > div > .comentario::before,
a > div > .comentario > .contenido > .media > a::before,
a > div > .comentario > .contenido > .media > a::after,
a > div > .comentario > .contenido > .media > img::before,
a > div > .comentario > .contenido > .media > img::after,
ul > div > .comentario::before,
ul > div > .comentario > .contenido > .media > a::before,
ul > div > .comentario > .contenido > .media > a::after,
ul > div > .comentario > .contenido > .media > img::before,
ul > div > .comentario > .contenido > .media > img::after,
.modoCuadrado > a::before,
.modoCuadrado > a::after,
.modoCuadrado > img::before,
.modoCuadrado > img::after {
  display: none;
}

.hilo-in,
.media > a,
.media > img,
.comentario {
  cursor: url(/imagenes/linterna.cur), auto;
}
`;
  } else {
    document.getElementById("corte").innerHTML = ``;
  }
</script>

<style></style>
