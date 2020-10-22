<script>
    import { fade, blur, fly } from 'svelte/transition';
    import comentarioStore from './comentarioStore'
    import RChanClient from '../../RChanClient'
    import ErrorValidacion from '../ErrorValidacion.svelte';
    export let hilo

    let creando = false

    let input
    $:contenido = $comentarioStore
    let archivo = null
    let archivoBlob = null

    let espera = 0
    let error = null

    async function crearComentario() {
        if(espera != 0 || creando) return

        try {
            await RChanClient.crearComentario(hilo.id, contenido, input.files[0])
            creando = true
        } catch (e) {
            error = e.response.data
            return
        }

        creando = false
        espera = 0
        contenido = ''
        archivo = null
        input.value = ''
        error = null
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

<form on:submit|preventDefault="" id="form-comentario" class="form-comentario panel">
    <ErrorValidacion {error}/>
    {#if archivo}
        <div transition:fly={{y: -50, duration:250}} class="archivo" style="position:relative">
            <img src="{archivoBlob}" alt="" srcset="">
            <div class="btn-cancel" on:click={removerArchivo}>
                <i class="fe fe-x-circle"></i>
            </div>
        </div>
    {/if}

    <textarea on:focus={() => error = null} bind:value={contenido} cols="30" rows="10"></textarea>

    <input bind:this={input} on:change={actualizarArchivo} type="file" id="comentario-input"
        style="position: absolute; top:-1000px">

    <div class="acciones">
        <button class="btn" on:click={() => input.click()}>
            <i class="fe fe-image"></i>
        </button>
        <button on:click|preventDefault={crearComentario} class="btn">Comentar</button>
    </div>
</form>
