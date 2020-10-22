<script>
import { Menu, Ripple, Button, Icon } from 'svelte-mui'
import config from "../../config"
import globalStore from '../../globalStore'
import MediaType from "../../MediaType"
import {fly} from "svelte/transition"

import more from '../../icons/more-vertical.svg'
import RChanClient from '../../RChanClient';

export let hilo
let categorias = config.categorias
let media = hilo.media
let destellando = false
let visible = true

let mostrarMenu = false

$: cantidadComentarios = hilo.cantidadComentarios

let recienCargado = true
$: destellar(cantidadComentarios)
function destellar(cantidadComentarios) {
    if(recienCargado){
        recienCargado = false
        return
    }
    destellando = true
    setTimeout(() => destellando = false, 2000)
}

async function toggle() {
    visible = !visible;
    if($globalStore.usuario.estaAutenticado){
        await RChanClient.agregar('ocultos', hilo.id)
    } else{

    }
}

// setInterval(() => {
//     hilo.cantidadComentarios+=1
// }, Math.random() * 5000 + 4000);
function onClick(e) {
    console.log(e.target.nodeName);
    if(e.target.nodeName == 'A' || e.target.nodeName == 'H3') {
        window.location = `/Hilo/${hilo.id}`
    }
}

console.log(hilo)
console.log(hilo.categoriaId)
</script>

<li class="hilo"
    on:mouseleave={() => mostrarMenu = false}
    >
    <div class="" style="top: 0;
    right: 0;
    z-index: 232;
    display: flex;
    flex-direction: column;
    position: absolute;">
     
        <Button icon color="white" style="margin-left: auto;"  on:click={()=> mostrarMenu = !mostrarMenu}>
            <Icon><svelte:component this={more} /></Icon> 
        </Button>
        {#if mostrarMenu}
            <ul class="menu-hilo" transition:fly|local={{x:-100}} on:mouseleave={() => mostrarMenu = false} >
                <li on:click={toggle}>{visible?'Ocultar':'Mostrar'} <Ripple/></li>
                <li>Reportar <Ripple/></li>
                {#if $globalStore.usuario.esMod}
                    <li>Eliminar <Ripple/></li>
                {/if}
            </ul>
        {/if}

    </div>
    {#if visible}
        <a  href="/Hilo/{hilo.id}" class="hilo-in" :bind:id={hilo.id} on:click={onClick} transition:fly|local={{duration:1000}}>
        <!-- <a  href="#asf" class="hilo-in" :bind:id={hilo.id}}> -->
            {#if destellando}
                <div class="destello"></div>
            {/if}
            <img src={media.vistaPreviaCuadrado} alt="{hilo.titulo}" class="imghilo">
            <div class="infos">
                {#if hilo.sticky > 0} <div class="info sticky-info"><Icon size="17" path="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12M8.8,14L10,12.8V4H14V12.8L15.2,14H8.8Z" /></div>{/if}
                {#if hilo.nuevo} <div class="info" style="background:#18222D">NUEVO</div>{/if}
                <div class="info" style="">{categorias[hilo.categoriaId - 1].nombreCorto}</div>
                {#if media.tipo == MediaType.Video} <div class="info" style="background:#18222D"><span class="fe fe-play"></span></div>{/if}
                {#if media.tipo == MediaType.Youtube} <div class="info" style="background:#fa2717"><span class="fe fe-play"></span></div>{/if}
                {#if false} <div class="info" ><span class="fe fe-bar-chart-2"></span></div>{/if}

                <div class="info">{hilo.cantidadComentarios}</div>
                
            </div>

            <h3>{hilo.titulo}</h3>
        </a>
    {/if}
</li>

<style>
    .menu-hilo {
        margin: 0;
        list-style: none;
        padding: 0;
        background: var(--color2) !important;
        border-radius: 4px;
        position: relative;
        right: 0;
        top: -40px;
        min-width: 150px;
        height:100%;
    }
    .menu-hilo li {
    position: relative;
    cursor: pointer;
    height: 44px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    display: flex;
    align-items: center;
    padding: 0 16px;
    white-space: nowrap;
    }
    .info {
        border-radius: 0 !important;
        margin: 0;
        height: 18px!important;
    }

    .info:first-child {
        border-radius: 800px 0 0 800px!important;
    }
    .info:last-child {
        border-radius: 0 800px 800px 0!important;
        padding-left: 0;
    }
    .sticky-info {
        background: var(--color1)
    }

</style>