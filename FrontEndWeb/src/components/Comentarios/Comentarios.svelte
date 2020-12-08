<script>
    import { fly } from 'svelte/transition';
    import Comentario from './Comentario.svelte'
    import Formulario from './Formulario.svelte'
    import globalStore from '../../globalStore'
    import DialogoReporte from '../Dialogos/DialogoReporte.svelte';
    import Signal from '../../signal'

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

     Signal.coneccion.on("NuevoComentario", onComentarioCreado)
     Signal.subscribirseAHilo(hilo.id)
     Signal.coneccion.on("ComentariosEliminados", ids => {
        comentarios = comentarios.filter(c => ! ids.includes(c.id))
        nuevosComentarios = nuevosComentarios.filter(c => ! ids.includes(c.id))
     })

    let resaltando = false;
    function resaltarComentariosDeUsuario(usuarioId) {
        if(!$globalStore.usuario.esMod) return;
        if(resaltando) {
            comentarios.forEach(c => c.resaltado = false)
            comentarios = comentarios   
            resaltando = false
            return;
        }
        comentarios.forEach(c => {
            if(c.usuarioId == c.usuarioId) {
                resaltando = true;
            }
            c.resaltado = usuarioId == c.usuarioId
        })
        comentarios = comentarios
    }

    function tagCliqueado(e) {
        comentarios.forEach(c => c.resaltado = false)
        comentarios = comentarios
        diccionarioComentarios[e.detail].resaltado = true;
    }
    

    let comentarioUrl = window.location.hash.replace("#", "")

    if(diccionarioComentarios[comentarioUrl]) {
        diccionarioComentarios[comentarioUrl].resaltado = true
    }
		
</script>
<div class="comentarios">
    {#if !window.config.general.modoMessi || $globalStore.usuario.esMod}
        <Formulario {hilo}/>
    {/if}
    <div class="contador-comentarios panel">
        <h3>Comentarios ({comentarios.length}) 
        </h3>
        {#if nuevosComentarios.length != 0}
            <div class="badge" style="    font-size: 18px;height: auto;cursor: pointer;">
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

                <Comentario 
                    on:colorClick={(e) => resaltarComentariosDeUsuario(e.detail.usuarioId || '') } 
                    hilo={hilo} 
                    bind:comentario {comentarios} comentariosDic = {diccionarioComentarios}
                    on:tagClickeado={tagCliqueado}
                    />
            </li>
            {/each}
            
        </div>

</div>