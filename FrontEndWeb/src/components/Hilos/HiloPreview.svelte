<script>
import { Ripple, Button, Icon } from 'svelte-mui'
import {abrir} from '../Dialogos/Dialogos.svelte'
import Menu from '../Menu.svelte'
import config from "../../config"
import globalStore from '../../globalStore'
import MediaType from "../../MediaType"
import {fly} from "svelte/transition"

import more from '../../icons/more-vertical.svg'
import RChanClient from '../../RChanClient';
import Dado from '../Dado.svelte'

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
        <Menu>
            <span slot="activador">
                <Button  icon color="white" style="margin-left: auto;"  on:click={()=> mostrarMenu = !mostrarMenu}>
                    <Icon><svelte:component this={more} /></Icon> 
                </Button>
            </span>
            <li on:click={toggle}>{visible?'Ocultar':'Mostrar'} <Ripple/></li>
            <li on:click={() => abrir.reporte(hilo.id, "")}>Reportar <Ripple/></li>
            {#if $globalStore.usuario.esMod}
                <li on:click={() => abrir.eliminarHilo(hilo.id, "")} >Eliminar <Ripple/></li>
                <li on:click={() => abrir.ban(hilo.id)} >Banear <Ripple/></li>
            {/if}
        </Menu>
    </div>
    {#if visible}
        <a  style="background:url({media.vistaPreviaCuadrado})" href="/Hilo/{hilo.id}" class="hilo-in" on:click={onClick} transition:fly|local={{duration:1000}}>
        <!-- <a  href="#asf" class="hilo-in" :bind:id={hilo.id}}> -->
            {#if destellando}
                <div class="destello"></div>
            {/if}
            <!-- <img src={media.vistaPreviaCuadrado} alt="{hilo.titulo}" class="imghilo"> -->
            <div class="infos">
                {#if hilo.sticky > 0} <div class="info sticky-info"><Icon size="17" path="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12M8.8,14L10,12.8V4H14V12.8L15.2,14H8.8Z" /></div>{/if}
                {#if hilo.nuevo} <div class="info" style="background:#18222D">NUEVO</div>{/if}
                <div class="info" style="">{(categorias[hilo.categoriaId - 1]?? {nombreCorto:"??"}).nombreCorto}</div>
                {#if media.tipo == MediaType.Video} <div class="info" style="background:#18222D"><span class="fe fe-play"></span></div>{/if}
                {#if media.tipo == MediaType.Youtube} <div class="info" style="var(--color5)"><span class="fe fe-play"></span></div>{/if}
                {#if false} <div class="info" ><span class="fe fe-bar-chart-2"></span></div>{/if}
                {#if hilo.dados}<Dado></Dado>{/if}

                <div class="info">{hilo.cantidadComentarios}</div>
                
            </div>

            <h3>{hilo.titulo}</h3>
        </a>
    {/if}
</li>



<style>
    .info {
        border-radius: 0 !important;
        margin: 0;
        height: 18px!important;
    }

    .info:first-child {
        border-radius: 50px 0 0 50px!important;
    }
    .info:last-child {
        border-radius: 0 50px 50px 0!important;
        padding-left: 0;
    }
    .sticky-info {
        background: var(--color1)
    }

    .hilo:hover :global(button) {
        background: rgb(23 33 43 / 22%) !important;
    }
    .hilo :global(button) {
        border-radius:  50% 0% 0% 50%;
    }


</style>