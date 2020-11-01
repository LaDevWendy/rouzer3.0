<script>
    import MediaType from '../MediaType'
    import {Button, ButtonGroup, Icon} from 'svelte-mui'
    import { onDestroy, onMount } from 'svelte';

    export let compacto = false

    export let archivo = null
    let archivoBlob = null
    let input = null
    let mediaType = MediaType.Imagen
    let el

    async function actualizarArchivo() {
        if (input.files && input.files[0]) {
            archivoBlob = await getBlobFromInput(input)
            archivo = input.files[0]

            if(input.files[0].type.indexOf('image') != -1) {
                mediaType = MediaType.Imagen
            } else if(input.files[0].type.indexOf('video') != -1) { 
                mediaType = MediaType.Video
            }
        }
    }

    async function getBlobFromInput(input) {
        
        return new Promise((resolve, reject) => {
            if (!(input.files && input.files[0])) return null;
            let blob
            let reader = new FileReader()
            reader.onload = function (e) {
                blob = e.target.result
                resolve(blob)
            }
            reader.readAsDataURL(input.files[0])
        })
    }

    function removerArchivo() {
        archivo = null
        archivoBlob = null
        input.value = ''
    }
    
    onDestroy(() => {
        archivo = null
        archivoBlob = null
    })

    onMount(() => {
        window.addEventListener('paste', e => {
            input.files = e.clipboardData.files;
            actualizarArchivo()
        });
    })

</script>
<input 
    name="archivo" 
    on:change={actualizarArchivo}
    type="file" 
    id="hilo-input" 
    style="position: absolute; top:-1000px"
    bind:this={input}

>
<div 
    bind:this={el} 
    class:compacto class="video-preview media-input"
    style="{ archivo&& mediaType != MediaType.Video?`background:url(${archivoBlob})`: 'background:url(/imagenes/rose2.jpg)'};overflow:hidden;">

    {#if mediaType == MediaType.Video && archivo}
        <video src="{archivoBlob}"></video>
    {/if}

    {#if !archivo}
        <span class="opciones">
            Agrega un archivo:
            <ButtonGroup>
                <Button on:click={() => input.click()} icon outlined shaped={true} on:click={() => true}> 
                     <icon class="fe fe-upload"></icon>
                </Button>
                <Button  icon outlined shaped={true} on:click={() => true}> 
                     <icon class="fe fe-link-2"></icon>
                </Button>
            </ButtonGroup>

            
        </span>
        <!-- <span class="descripcion"style="position: absolute">Subi una imagen o un video para crear el hilo</span>
        <span class="descripcion"style="position: absolute">O tambien podes importar un link</span> -->
    {:else}
        <Button class="cancelar" on:click={() => archivo = null} icon outlined shaped={true} on:click={() => true}> 
            <icon class="fe fe-x"></icon>
        </Button>
    {/if}
    <!-- <span on:click={() => input.click()} class="fe fe-upload ico-btn" style="z-index:100"></span> -->
</div>

<style>
    .opciones {
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: space-evenly;
        height: fit-content;
        margin-top: auto;
    }
    .media-input :global(.cancelar) {
        margin-left: auto;
    }

    .compacto {
        height: auto;
        width: 100%;
        margin-left: 0;
    }
</style>