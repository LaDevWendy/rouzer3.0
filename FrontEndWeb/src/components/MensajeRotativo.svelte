<script>
    import { onMount } from 'svelte';
    export let texto = `¿por favor. necesito ayuda. acabo de discutir con mi mujer, y de la bronca, le arroje el monitor en la cabeza..?
quedo en el piso

estoy desesperado..

no se que hacer.. 

el monitor  prende..pero  se ve con una raya al medio

necesito ayuda urgente.

Actualización:
pido solucion para el monitor. como hago para que funcione bien. no es mio. y no pienso regalar el que eestoy utilizando para escribir por aqui`
    let textWidth = 0
    let rt1
    let rt2
    let width = 100
    let duracion = 100
    $: if(width && rt1  && rt2) {
        duracion =  width / 25
        rt1.classList.remove("rt1")
        rt2.classList.remove("rt2")
        setTimeout(() => {
            rt1.classList.add("rt1")
            rt2.classList.add("rt2")
        },50)
    }


</script>
<div bind:offsetWidth={width} class="container">
    <div class="mensaje-rotativo" style="--width: {textWidth}px; --duracion: {duracion}s">
        <span bind:this={rt1} bind:offsetWidth={textWidth} class="rt1">{texto}</span>
        <span bind:this={rt2} class="rt2">{texto}</span>
    </div>
</div>

<style>
.container {
    position: relative;
    width: 100%;
    height: 20px;
}
.mensaje-rotativo {
    position: absolute;
    clip: rect(auto, auto, auto, auto);
    height: 20px;
    width: 100%;
}
@keyframes rotativo {
    from{transform: translate(var(--width));}
    to{transform: translate(0);}
}
@keyframes rotativo2 {
    from{transform: translate(0);}
  to{transform: translate(calc(var(--width) * -1));}
}

.mensaje-rotativo span {
    position:absolute;
    animation-duration: var(--duracion);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    color: white;
    width: max-content;


}
.rt1 {
  animation-name: rotativo;
}

.rt2 {
  animation-name: rotativo2;
  color: red;
}
</style>