<script>
    import MediaType from '../MediaType'
    export let archivo = null
    let archivoBlob = null
    let input = null
    let mediaType = MediaType.Imagen

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
        archivo = nullb
        archivoBlob = null
        input.value = ''
    }

</script>
<input 
    name="archivo" 
    on:change={actualizarArchivo}
    type="file" 
    id="hilo-input" 
    style="position: absolute; top:-1000px"
    bind:this={input}

>
<div  class="video-preview" style="{ archivo&& mediaType != MediaType.Video?`background:url(${archivoBlob})`: ''};overflow:hidden;">

    {#if mediaType == MediaType.Video}
        <video src="{archivoBlob}"></video>
    {/if}

    {#if !archivo}
        <span class="descripcion"style="position: absolute">Subi una imagen o un video para crear el hilo</span>
    {/if}
    <span on:click={() => input.click()} class="fe fe-upload ico-btn" style="z-index:100"></span>
</div>
