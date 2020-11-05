<script>
    import { fade, blur, fly } from 'svelte/transition';
    import { Button } from 'svelte-mui'
    import comentarioStore from './comentarioStore'
    import RChanClient from '../../RChanClient'
    import ErrorValidacion from '../ErrorValidacion.svelte';
    import MediaInput from '../MediaInput.svelte';
    import Spinner from '../Spinner.svelte';
    import config from '../../config';
import globalStore from '../../globalStore';
    export let hilo

    let cargando = false

    $comentarioStore
    let media

    let espera = 0
    $: if(espera != 0) {
        setTimeout(()=> espera--, 1000)
    }
    let error = null

    async function crearComentario() {
        if(espera != 0 || cargando) return

        try {
            cargando = true
            await RChanClient.crearComentario(hilo.id, $comentarioStore, media.archivo, media.link)
            if(!$globalStore.usuario.esMod) {
                espera = config.general.tiempoEntreComentarios
            }
        } catch (e) {
            error = e.response.data
            cargando = false
            return
        }
        
        cargando = false
        $comentarioStore = ''
        media.archivo = null
        error = null
    }

</script>

<form on:submit|preventDefault="" id="form-comentario" class="form-comentario panel">
    <ErrorValidacion {error}/>

    <MediaInput bind:media={media} compacto={true}></MediaInput>
    <textarea on:focus={() => error = null} bind:value={$comentarioStore} cols="30" rows="10" placeholder="Que dificil discutir con pibes..."></textarea>

    <div class="acciones">
        <Button  disabled={cargando} color="primary"  class="mra" on:click={crearComentario}>
            <Spinner {cargando}>{espera == 0? 'Responder': espera}</Spinner>
        </Button>
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