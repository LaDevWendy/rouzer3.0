<script>
    import { onMount } from 'svelte'
    import { createEventDispatcher } from 'svelte';
    import {Menuitem, Button, Icon, Ripple } from 'svelte-mui';
    import Menu from '../Menu.svelte'
    import comentarioStore from './comentarioStore'
    import { fly } from 'svelte/transition';
    
    import Tiempo from '../Tiempo.svelte'
    import globalStore from '../../globalStore';
    import Media from '../Media.svelte';
    import {abrir} from '../Dialogos/Dialogos.svelte'
    import { ComentarioEstado, CreacionRango } from '../../enums';
    import selectorStore from '../Moderacion/selectorStore'

    export let comentario;
    export let hilo;
    export let comentariosDic = {   };
    export let resaltado = false

    export let esRespuesta = false
    
    let el
    let respuestas
    let mostrandoRespuesta = false
    let respuestaMostrada
    
    let windowsWidh = window.screen.width

    let visible = !$globalStore.comentariosOcultos.has(comentario.id)
    
    let dispatch = createEventDispatcher()
    
    let mostrarMenu = false

    

    onMount(() => {

        let respuestas = el.querySelectorAll(".restag")
        respuestas.forEach(r => {
            r.addEventListener("mouseover", () => mostrarRespuesta(r.getAttribute("r-id").trim()))
            r.addEventListener("mouseleave", ocultarRespuesta)
            r.addEventListener("click", () => resaltarCliqueado(r.getAttribute("r-id").trim()))
        })
    })

    function mostrarRespuesta(id) {
        mostrandoRespuesta = true
        respuestaMostrada = comentariosDic[id]
    }

    function resaltarCliqueado(id) {
        dispatch("tagClickeado", id)
    }

    function ocultarRespuesta() {
        mostrandoRespuesta = false
    }

    function toggle() {
        if(visible) {
            $globalStore.comentariosOcultos.set(comentario.id, true)
        } else {
            $globalStore.comentariosOcultos.delete(comentario.id)
        }
        $globalStore.comentariosOcultos = $globalStore.comentariosOcultos 
        visible = !visible
    }

    function seleccionar() {
        if(!$globalStore.usuario.esMod) return;
        selectorStore.selecionar(comentario.id)
    }

    let mostrarReporte = true

    if(!Array.isArray(comentario.respuestas)) comentario.respuestas = []

    function tagear(id) {
        if(!$comentarioStore.includes(`>>${comentario.id}\n`))
            $comentarioStore+= `>>${comentario.id}\n`
    }

    function esOp(comentarioId) {
        let  comentario = comentariosDic[comentarioId] ?? {esOp:false}
        return comentario.esOp
    }
</script>

<div bind:this={el}
    class:resaltado={comentario.resaltado  || resaltado|| $selectorStore.seleccionados.has(comentario.id)} 
    class="comentario {windowsWidh <= 400?"comentario-movil":""}" 
    class:eliminado = {comentario?.estado  || 0 == ComentarioEstado.eliminado}
    class:comentarioMod = {comentario.rango > CreacionRango.Anon}
    r-id="{comentario.id}" id="{comentario.id}{esRespuesta?'-res':''}">
    <div  class="respuestas">
        {#each comentario.respuestas as r }
        <a href="#{r}" class="restag" r-id="{r}"
            on:mouseover={() => mostrarRespuesta(r)}
            on:mouseleave={ocultarRespuesta}
        >&gt;&gt;{r}{esOp(r)?'(OP)' : ''} </a> 
        {/each}
    </div    >
    <div on:click={() => dispatch("colorClick", comentario)} 
        class="color color-{comentario.color}"
        class:dado={comentario.dados != undefined && comentario.dados != -1}
    >
        {#if comentario.dados!= undefined && comentario.dados != -1}
            {comentario.dados}
        {:else}
            {CreacionRango.aString(comentario.rango).toUpperCase()}
        {/if}
    </div>
    <div class="header">
        {#if comentario.esOp} <span class="nick tag tag-op">OP</span>{/if}
        <span 
            on:click={seleccionar}
            class:nombreResaltado = {comentario.nombre} 
            class="nick nombre cptr">{comentario.nombre ||'Gordo'}</span>
        {#if comentario.usuarioId}
        <a href="/Moderacion/HistorialDeUsuario/{comentario.usuarioId}" style="color:var(--color6) !important">
            <span class="nick">{comentario.usuarioId.split("-")[0]}</span>
        </a>
        {/if}
        <!-- <span class="rol tag">anon</span> -->
        <span class="id tag" on:click={() => tagear(comentario.id)}>{comentario.id}</span>
        <span class="tiempo"><Tiempo date={comentario.creacion}/></span>

        <div>
            <Menu>
                <span slot="activador" on:click={() => mostrarMenu = true} class=""><i class="fe fe-more-vertical relative"></i></span>
                <li on:click={() => toggle()}>{visible?'Ocultar':'Mostrar'}</li>
                <li on:click={() => abrir.reporte(hilo?.id || comentario.hiloId, comentario.id)}>Reportar</li>
                {#if $globalStore.usuario.esMod}
                    <hr>
                    {#if comentario.hiloId}
                        <a href="/Hilo/{comentario.hiloId}#{comentario.id}" style="color:white!important">
                            <Menuitem>Ir</Menuitem>
                        </a>
                    {/if}
                    <Menuitem on:click={() => abrir.ban(hilo?.id || comentario.hiloId, comentario.id)} >Banear</Menuitem>
                    {#if comentario.estado == ComentarioEstado.normal}
                    <Menuitem on:click={() => abrir.eliminarComentarios([comentario.id])}>Eliminar</Menuitem>
                    {:else}
                        <Menuitem on:click={() => abrir.restaurarComentario(comentario.id)} >Restaurar</Menuitem>
                    {/if}
                {/if}
            </Menu>
        </div>

    </div>
    <div class="respuestas">
    </div>
    {#if visible}
        <div class="contenido">
            {#if comentario.media}
                <Media media={comentario.media}/>
            {/if}
            <div class="texto">
                {@html comentario.contenido}
            </div>
        </div>
    {/if}
    {#if mostrandoRespuesta}
        <div transition:fly|local={{x: -50, duration:150}} class="comentario-flotante">
            <svelte:self comentario = {respuestaMostrada}  esRespuesta={true}></svelte:self>
        </div>
    {/if}
</div>

<style>
    .comentario {
        display: grid;
        gap: 10px;
        grid-template-columns: 50px calc(100% - 60px);
        grid-template-areas:
            "color header"
            "color respuestas"
            "color cuerpo";
        padding: 10px;
        position: relative;
        margin-bottom: 8px;
        text-underline-position: under;
    }

    .comentario .contenido {
        grid-area: cuerpo;
    }

    .comentario .texto {
        white-space: pre-wrap;
        word-break: break-word;
        overflow: hidden;
    }

    .respuestas {
        grid-area: respuestas;
        font-size: 0.7em;
        flex-wrap: wrap;
        display: flex;
        gap: 4px;
    }

    .contenido .media {
        float: left;
        margin-right: 10px;
        max-width: 50%;
    }

    .color {
        width: 50px;
        height: 50px;
        background: orange;
        grid-area: color;
        display: flex;
        align-items: center;
        padding: 2px;
        /* text-align: center; */
        font-stretch: condensed;
        /* border-radius: 10; */
        justify-content: center;
        font-weight: 600;
        /* color: #822f0047; */
        color: #ffffffe3;
        border-radius: 4px;
    }

    .comentario .header {
        grid-template-areas: color;
        display: flex;
        align-items: center;
        margin-bottom: 0;
        font-size: 0.9em
    }

    .comentario .header span {
        margin-right: 10px;
    }

    .comentario .header .id {
        cursor: pointer;
    }

    .comentario .tag {
        background: #000000ad;
        padding: 0 5px;
        border-radius: 500px;
        display: flex;
        align-items: center;
    }

    .comentario .tiempo {
        margin-left: auto;
        opacity: 0.5;
        font-size: 12px;
    }

    .tag-op {
        background: var(--color5) !important;
    }
    .comentario:hover {
        background: var(--color4);
    }

    .resaltado {
        background: var(--color7)!important;
    }
    .eliminado {
        border-left: solid 2px red !important;
    }

    .color-rojo {background: #dd3226;}

    .color-verde {background: #53a538;}

    .color-amarillo {background: #ffc400;}

    .color-azul {background: #00408a;}

    .color-rosa {background: #ff74c1;}
    
    .color-negro {background: #000000;}
    
    .color-marron {background: #492916;}

    .color-multi {
        background: linear-gradient(#ffc400    25%, #00408a  25%, #00408a  50%, #53a538   50%, #53a538   75%, #dd3226  75%, #dd3226  100%);
        animation: multi .3s infinite;
    }
    
    @keyframes multi {
        20%  { background: linear-gradient(#dd3226 25%, #ffc400 25%, #ffc400 50%, #00408a 50%, #00408a 75%, #53a538 75%, #53a538 100%);}
        60%  { background: linear-gradient(#53a538 25%, #dd3226 25%, #dd3226 50%, #ffc400 50%, #ffc400 75%, #00408a 75%, #00408a 100%);}
        80%  { background: linear-gradient(#00408a 25%, #53a538 25%, #53a538 50%, #dd3226 50%, #dd3226 75%, #ffc400 75%, #ffc400 100%);}
        100% { background: linear-gradient(#ffc400 25%, #00408a 25%, #00408a 50%, #53a538 50%, #53a538 75%, #dd3226 75%, #dd3226 100%);}
    }

    .comentarioMod  {
        border-top: solid 2px;
        animation: borde-luz 0.3s infinite alternate-reverse;
    }
    .nombreResaltado {
        color: var(--color6);
        font-weight: bold;
    }

    .comentarioMod >.color {
        animation: luces 0.3s infinite alternate-reverse;
    }

    @keyframes borde-luz {
        0% {border-color: red;}
        100% {border-color: blue;}
    }
    @keyframes luces {
        0% {
            background: red;
            border-color: red;

        }
        100% {
            background: blue;
            border-color: blue;

        }
    }

    .cptr {
        cursor: pointer;
    }
.dado {
    font-size: 2rem;
    font-family: 'euroFighter';
}
@media (max-width: 600px) {
  .comentario :global(.restag) {
      font-weight: bold !important;
  }
}
    /* @media(max-width >600px) {} */

    /* .comentario-movil :glo.media {
  max-width: 100%;
  width: 100%;
}
.comentario-movil .color {
  height: 30px;
  position: relative;
  top: -8px;
  left: -8px;
}
.comentario-movil {
  grid-template-areas:
  "color header"
  "respuestas respuestas"
  "cuerpo cuerpo";
} */
</style>