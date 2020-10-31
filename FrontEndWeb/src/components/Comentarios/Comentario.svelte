<script>
    import { onMount } from 'svelte'
    import { createEventDispatcher } from 'svelte';
    import {Menuitem, Button, Icon, Ripple } from 'svelte-mui';
    import Menu from '../Menu.svelte'
    import comentarioStore from './comentarioStore'
    import { fade, blur, fly } from 'svelte/transition';
    
    import Tiempo from '../Tiempo.svelte'
    import globalStore from '../../globalStore';
    import Media from '../Media.svelte';
    import {abrir} from '../Dialogos/Dialogos.svelte'


    export let comentario;
    export let hilo;
    export let comentariosDic = {   };
    
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
        })
    })

    function mostrarRespuesta(id) {
        mostrandoRespuesta = true
        respuestaMostrada = comentariosDic[id]
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

    let mostrarReporte = true

    if(!Array.isArray(comentario.respuestas)) comentario.respuestas = []

</script>

<div bind:this={el} class="comentario {windowsWidh <= 400?"comentario-movil":""}" r-id="{comentario.id}" id="{comentario.id}">
    <div  class="respuestas">
        {#each comentario.respuestas as r (r)}
        <a href="#{r}" class="restag" r-r="{r}"
            on:mouseover={() => mostrarRespuesta(r)}
            on:mouseleave={ocultarRespuesta}
        >&gt;&gt;{r}</a> 
        {/each}
    </div    >
    <div class="color" style="background: {comentario.color};">ANON</div>
    <div class="header">
        {#if comentario.esOp} <span class="nick tag tag-op">OP</span>{/if}
        <span class="nick">Gordo</span>
        <!-- <span class="rol tag">anon</span> -->
        <span class="id tag" on:click={()=>$comentarioStore+= `>>${comentario.id}\n`}>{comentario.id}</span>
        <span class="tiempo"><Tiempo date={comentario.creacion}/></span>

        <div>
            <Menu>
                <span slot="activador" on:click={() => mostrarMenu = true} class=""><i class="fe fe-more-vertical relative"></i></span>
                <li>Ocultar</li>
                <li on:click={() => abrir.reporte(hilo.id, comentario.id)}>Reportar</li>
                {#if $globalStore.usuario.esMod}
                    <hr>
                    <Menuitem >Eliminar</Menuitem>
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
            <svelte:self comentario = {respuestaMostrada} ></svelte:self>
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
    }

    .respuestas {
        grid-area: respuestas;
        font-size: 0.7em;
        flex-wrap: wrap;
            display: flex;
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
        color: #1825338c;
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
        filter: brightness(1.2);
    }

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