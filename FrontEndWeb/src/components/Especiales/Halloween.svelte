<script>
  import { configStore } from "../../config";
  let activated = false;

  $: activated = $configStore.general.flags.includes("halloween");

  $: if (activated) {
    document.getElementById("halloween").innerHTML = `
body {
  --color1: #4e2508;
  --color2: rgb(20 20 20);
  --color3: rgb(30 30 30);
  --color4: rgb(40 40 40);
  --color5: #ff730f;
  --color6: #fc9208;
  --color7: #603300;
}
/*.hilo>.hilo-in::after{
     content:"";
     background:url(/imagenes/bats.png);
     background-size:cover;
     top:0;
     left:0;
     width:100%;
     height:100%;
     position:absolute 
}
*/
#fondo-global,
.media-input,
.menu-principal-header {
  filter: grayscale(100%);
}
.color-ario::after,
.color-azul::after,
.color-blanco::after,
.color-invertido::after,
.color-marron::after,
.color-multi::after,
.color-navideño::after,
.color-negro::after,
.color-rojo::after,
.color-rosa::after,
.color-serio::after,
.color-verde::after,
.color-ucraniano::after {
  content: "";
  background: url(/imagenes/mask3.png);
  position: absolute;
  top: 10px;
  left: 10px;
  height: 50px;
  width: 50px;
  background-size: 100%;
  background-repeat: no-repeat;
  border-radius: 3px;
}
.color-amarillo::after,
.color-ruso::after {
  content: "";
  background: url(/imagenes/mask2.png);
  position: absolute;
  top: 10px;
  left: 10px;
  height: 50px;
  width: 50px;
  background-size: 100%;
  background-repeat: no-repeat;
  border-radius: 3px;
}
.color {
  color: transparent !important;
}
.hilo h3,
.infos {
  z-index: 1;
}
.dado {
  color: #fff !important;
  font-size: 1rem !important;
  display: inline !important;
  text-align: center;
  padding-top: 15% !important;
}
.color-ario.dado {
  color: #00abec !important;
}
.color-blanco.dado,
.color-ruso.dado,
.color-ucraniano.dado {
  color: black !important;
}
.lista-stickies .sticky .color::after {
  height: 40px;
  width: 40px;
}
`;
  } else {
    document.getElementById("halloween").innerHTML = ``;
  }
</script>

<style></style>
