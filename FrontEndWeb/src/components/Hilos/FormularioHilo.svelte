<script>
import { fade, blur, fly } from 'svelte/transition';
import { Button, Ripple} from 'svelte-mui';
import config from "../../config";
import RChanClient from '../../RChanClient';
import ErrorValidacion from '../ErrorValidacion.svelte';

export let mostrar = false

let titulo = ""
let categoria = "-1"
let contenido = ""

let archivo = null
let archivoBlob = null
let input = null

let error = null

async function crear() {
    console.log("creando");
    try {
        let r = await RChanClient.crearHilo(titulo, categoria, contenido, archivo)
        if (r.status == 201) {
                window.location.replace(r.headers.location)
            }
    } catch (e) {
       error = e.response.data
    }
}
function actualizarArchivo() {
    if (input.files && input.files[0]) {
        var reader = new FileReader()
        reader.onload = function (e) {
            archivoBlob = e.target.result
            archivo = input.files[0]
        };

        reader.readAsDataURL(input.files[0])
    }
}

function removerArchivo() {
    archivo = null
    archivoBlob = null
    input.value = ''
}
</script>

{#if mostrar}
<div  transition:fly={{y: -50, duration:250}}  class="sombra" style="position:fixed;left:0;top:0" on:click|self={() => mostrar = false}>
    <form  
        id="crear-hilo-form" 
        class="formulario crear-hilo panel"
        on:submit|preventDefault
    >
        <input 
            name="archivo" 
            on:change={actualizarArchivo}
            type="file" 
            id="hilo-input" 
            style="position: absolute; top:-1000px"
            bind:this={input}
            
            >

        <span asp-validation-for="Archivo"></span>
        <div  class="video-preview" style="{ archivo?`background:url(${archivoBlob})`: ''}">
            {#if !archivo}
                <span class="descripcion"style="position: absolute">Subi una imagen o un video para crear el hilo</span>
            {/if}
            <span on:click={() => input.click()} class="fe fe-upload ico-btn"></span>
        </div>

        <span asp-validation-for="Titulo"></span>
        <input bind:value={titulo} name="titulo" placeholder="Titulo">

        <span asp-validation-for="CategoriaId"></span>
        <select bind:value={categoria}  name="categoria">
            <option value="-1" selected="selected" disabled="disabled">Categoría</option>
            {#each config.categorias as c}
                <option value="{c.id}">{c.nombre}</option>
            {/each}
        </select>

        <span asp-validation-for="Contenido" ></span>
        <textarea bind:value={contenido} name="contenido" placeholder="Escribi un redactazo..."></textarea>

        <ErrorValidacion {error}/>

        <!-- <button class="btn" type="submit">Crear</button> -->
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


    
</style>