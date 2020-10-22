<script>
    import { onMount } from 'svelte'
    import { Menu, Menuitem, Button, Icon } from 'svelte-mui';
    import comentarioStore from './comentarioStore'
    import { fade, blur, fly } from 'svelte/transition';
    
    import Tiempo from '../Tiempo.svelte'
    import globalStore from '../../globalStore';

    export let comentario;
    export let comentariosDic = {   };
    
    let el
    let respuestas
    let mostrandoRespuesta = false
    let respuestaMostrada

    let windowsWidh = window.screen.width

    let visible = !$globalStore.comentariosOcultos.has(comentario.id)

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

</script>

<div bind:this={el} class="comentario {windowsWidh <= 400?"comentario-movil":""}" r-id="{comentario.id}" id="{comentario.id}">
    <div  class="respuestas">
        {#each comentario.respuestas as r (r)}
        <a href="#{r}" class="restag" r-r="{r}"
            on:mouseover={() => mostrarRespuesta(r)}
            on:mouseleave={ocultarRespuesta}
        >>>{r}</a>
        {/each}
    </div    >
    <div class="color" style="background: {comentario.color};">ANON</div>
    <div class="header">
        {#if comentario.esOp} <span class="nick tag">OP</span>{/if}
        <span class="nick">Gordo</span>
        <span class="rol tag">anon</span>
        <span class="id tag" on:click={()=>$comentarioStore+= `>>${comentario.id}\n`}>{comentario.id}</span>
        <span class="tiempo"><Tiempo date={comentario.creacion}/></span>

        <Menu origin="top right">
            <div slot="activator">
                <span onclick="" class=""><i
                    class="fe fe-more-vertical relative"></i></span>
            </div>
        
            <Menuitem on:click={toggle} >{visible?'Ocultar':'Mostrar  '}</Menuitem>
            <Menuitem >Reportar</Menuitem>
            {#if $globalStore.usuario.esMod}
                <hr>
                <Menuitem >Eliminar</Menuitem>
            {/if}

        </Menu>
        
        
    </div>
    <div class="respuestas">
    </div>
    {#if visible}
        <div class="contenido">
            <div class="media">
                {#if comentario.media}
                    {#if comentario.media.tipo  == 1 || true}
                        {#if comentario.media.esGif}
                            <a href="/{comentario.media.url}" target="_blank">
                                <img src="/{comentario.media.url}" alt="" srcset="">
                            </a>
                        {:else}
                            <a href="/{comentario.media.url}" target="_blank">
                                <img src="{comentario.media.vistaPrevia}" alt="" srcset="">
                            </a>
                        {/if}
                    {/if}
                {/if}
            </div>
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
