<script>
    import { fade, blur, fly } from 'svelte/transition';
    import { Button } from 'svelte-mui'
    import comentarioStore from './comentarioStore'
    import RChanClient from '../../RChanClient'
    import ErrorValidacion from '../ErrorValidacion.svelte';
    import MediaInput from '../MediaInput.svelte';
    export let hilo

    let creando = false

    $comentarioStore
    let archivo = null

    let espera = 0
    let error = null

    async function crearComentario() {
        if(espera != 0 || creando) return

        try {
            await RChanClient.crearComentario(hilo.id, $comentarioStore, archivo)
            creando = true
        } catch (e) {
            error = e.response.data
            return
        }

        creando = false
        espera = 0
        $comentarioStore = ''
        archivo = null
        error = null
    }

</script>

<form on:submit|preventDefault="" id="form-comentario" class="form-comentario panel">
    <ErrorValidacion {error}/>

    <MediaInput bind:archivo={archivo} compacto={true}></MediaInput>
    <textarea on:focus={() => error = null} bind:value={$comentarioStore} cols="30" rows="10" placeholder="Que dificil discutir con pibes..."></textarea>

    <div class="acciones">
        <Button  color="primary"  class="mra" on:click={crearComentario}>Responder</Button>
    </div>
</form>


<style>
    .acciones :global(.mra) {
        margin-left: auto;
    }
    .form-comentario :global(.media-input) {
        margin-left: 0;
    }
</style>