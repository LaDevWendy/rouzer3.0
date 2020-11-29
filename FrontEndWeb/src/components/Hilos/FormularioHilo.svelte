<script>
import { fade, blur, fly } from 'svelte/transition';
import { Button, Ripple, Checkbox} from 'svelte-mui';
import config from "../../config";
import RChanClient from '../../RChanClient';
import ErrorValidacion from '../ErrorValidacion.svelte';
import MediaType from '../../MediaType'
import MediaInput from '../MediaInput.svelte';
import Captcha from '../Captcha.svelte';
import Spinner from '../Spinner.svelte';
import globalStore from '../../globalStore';

export let mostrar = false

let titulo = ""
let categoria = "-1"
let contenido = ""
let media
let captcha = ""

let mostrarRango = false
let mostrarNombre = false

let cargando = false


let error = null

async function crear() {
    cargando = true
    try {
        let r = null 
        if(!$globalStore.usuario.esMod){
                r = await  await RChanClient.crearHilo(titulo, categoria, contenido, media.archivo, media.link, captcha)
            } else {
                r = await  await RChanClient.crearHilo(titulo, categoria, contenido, media.archivo, media.link, captcha, mostrarNombre, mostrarRango)
            }
        if (r.status == 201) {
                window.location.replace(r.headers.location)
            }
    } catch (e) {
       error = e.response.data
    }
    cargando = false
}

</script>

{#if mostrar}
<div  transition:fly={{duration:200}}  class="sombra" style="position:fixed;left:0;top:0">
    <form  
        id="crear-hilo-form" 
        class="formulario crear-hilo panel"
        on:submit|preventDefault
    >

        <MediaInput bind:media={media}></MediaInput>

        <input bind:value={titulo} name="titulo" placeholder="Titulo">

        <select bind:value={categoria}  name="categoria">
            <option value="-1" selected="selected" disabled="disabled">Categoría</option>
            {#each config.categorias as c}
                <option value="{c.id}">{c.nombre}</option>
            {/each}
        </select>

        <textarea rows="5" style="background: var(--color4);" bind:value={contenido} name="contenido" placeholder="Escribi un redactazo..."></textarea>

        <ErrorValidacion {error}/>

        {#if $globalStore.usuario.esMod}
        <div style=" flex-direction:row; display:flex">
            <Checkbox bind:checked={mostrarRango} right>Tag_Mod</Checkbox>
            <Checkbox bind:checked={mostrarNombre} right>Nombre</Checkbox>
        </div>
    {/if}
        <Captcha visible={config.general.captchaHilo}  bind:token={captcha}/>
        <div style="display:flex;     justify-content: flex-end;">
            <Button color="primary" on:click={() => mostrar = false}>Cancelar</Button>
                <Button color="primary" disabled={cargando} on:click={crear} >
                    <Spinner {cargando}>
                        Crear
                    </Spinner>
                </Button>
            <input type="submit" style="display:none">
        </div>
    </form>

</div>
{/if}

<style>
    .nav-boton {
        padding: 12px;
        align-items: center;
        display:flex;
        cursor: pointer;
    }

    video {
        width: 486px;
        height: 319px;
        top: -10px;
        position: absolute;
    }
    form {
        border-top: 2px solid var(--color5);
        max-height: 80vh !important;
        overflow-y: auto;
        max-width: unset;
        width: fit-content;
    }
    @media (min-width: 600px) {
    form {
            min-width: 500px;
        }
    }
    @media (max-width: 400px) {
    form {
            width: 100%;
            height: 94vh;
        }
    }
</style>