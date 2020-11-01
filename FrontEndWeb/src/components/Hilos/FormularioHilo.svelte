<script>
import { fade, blur, fly } from 'svelte/transition';
import { Button, Ripple} from 'svelte-mui';
import config from "../../config";
import RChanClient from '../../RChanClient';
import ErrorValidacion from '../ErrorValidacion.svelte';
import MediaType from '../../MediaType'
import MediaInput from '../MediaInput.svelte';
import Captcha from '../Captcha.svelte';

export let mostrar = false

let titulo = ""
let categoria = "-1"
let contenido = ""
let archivo = null
let captcha = ""

let error = null

async function crear() {
    console.log("creando");
    try {
        let r = await RChanClient.crearHilo(titulo, categoria, contenido, archivo, captcha)
        if (r.status == 201) {
                window.location.replace(r.headers.location)
            }
    } catch (e) {
       error = e.response.data
    }
}

</script>

{#if mostrar}
<div  transition:fly={{duration:200}}  class="sombra" style="position:fixed;left:0;top:0" on:click|self={() => mostrar = false}>
    <form  
        id="crear-hilo-form" 
        class="formulario crear-hilo panel"
        on:submit|preventDefault
    >

        <MediaInput bind:archivo={archivo}></MediaInput>

        <input bind:value={titulo} name="titulo" placeholder="Titulo">

        <select bind:value={categoria}  name="categoria">
            <option value="-1" selected="selected" disabled="disabled">Categoría</option>
            {#each config.categorias as c}
                <option value="{c.id}">{c.nombre}</option>
            {/each}
        </select>

        <textarea bind:value={contenido} name="contenido" placeholder="Escribi un redactazo..."></textarea>

        <ErrorValidacion {error}/>

        <!-- <button class="btn" type="submit">Crear</button> -->
        <Captcha visible={config.general.captchaHilo}  bind:token={captcha}/>
        <div style="display:flex;     justify-content: flex-end;">
            <Button color="primary" on:click={() => mostrar = false}>Cancelar</Button>
            <Button color="primary" on:click={crear}>Crear</Button>
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
    }
</style>