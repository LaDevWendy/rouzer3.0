<script>
    import { fade, blur, fly } from 'svelte/transition';
    import Comentario from './Comentario.svelte'
    import Formulario from './Formulario.svelte'
    import {HubConnectionBuilder} from '@microsoft/signalr'
    import globalStore from '../../globalStore'
    import { onMount } from 'svelte';
    import VirtualList from '@sveltejs/svelte-virtual-list';
    import DialogoReporte from '../Dialogos/DialogoReporte.svelte';

    export let hilo
    export let comentarios
    let nuevosComentarios = []

    function cargarNuevosComentarios() {
        comentarios = [...nuevosComentarios, ...comentarios]
        nuevosComentarios = []
    }

    let diccionarioRespuestas = {}
	let diccionarioComentarios = {}

	comentarios
		.forEach(c => {
			diccionarioComentarios[c.id] = c
			let tags = c.contenido.match(/#([A-Z0-9]{8})/g)
			if(!tags) return;
			let id = c.id
			for(const tag of tags) {
				let otraId = tag.slice(1, 9)
				if(!diccionarioRespuestas[otraId]) diccionarioRespuestas[otraId] = []
				diccionarioRespuestas[otraId].push(id)
			}
		})
	
	comentarios.forEach(c => {
		if(diccionarioRespuestas[c.id]) c.respuestas = [...diccionarioRespuestas[c.id]]
		else c.respuestas = []
    })

    function onComentarioCreado(comentario) {
        comentario.respuestas = []
        // Añadir el restag a los comentarios tageados por este comentario
        nuevosComentarios = [comentario, ...nuevosComentarios]
    }

    let connection = new HubConnectionBuilder().withUrl("/hub").build();
    connection.on("NuevoComentario", onComentarioCreado)
    connection.start().then(() => {
        console.log("Conectadito");
        return connection.invoke("SubscribirseAHilo", hilo.id)
        
    }).catch(console.error)

    let mostrarReporte = false
    let comentarioIdReporte = null
    function onMostrarReporte(e) {
        console.log(e);
        mostrarReporte = true
        comentarioIdReporte = e.detail.comentarioId

    }
    
		
</script>
<div class="comentarios">
    <Formulario {hilo}/>
    <div class="contador-comentarios panel">
        <h3>Comentarios ({comentarios.length}) 
        </h3>
        {#if nuevosComentarios.length != 0}
            <div class="badge">
                <span on:click={cargarNuevosComentarios}>+ {nuevosComentarios.length}</span>
            </div>
        {/if}
        <div class="acciones-comentario">
            <i class="fe fe-folder"></i>
            {#if comentarios.length > 0}
            <a href="#{comentarios[comentarios.length -1].id} ">
                <i class="fe fe-arrow-down"></i>
            </a>
            {/if}
        </div>
    </div>
    <div class="lista-comentarios">
        {#each comentarios as comentario (comentario.id)}
            <li transition:fly|local={{y: -50, duration:250}}>

                <Comentario hilo={hilo} bind:comentario {comentarios} comentariosDic = {diccionarioComentarios}/>
            </li>
            {/each}
            
        </div>

</div>