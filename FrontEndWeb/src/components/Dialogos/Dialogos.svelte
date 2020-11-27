<script context="module">
    import {writable} from 'svelte/store'
    import RChanClient from '../../RChanClient';
    import Dialogo from '../Dialogo.svelte'
    import DialogoBan from './DialogoBan.svelte';
    import DialogoReporte from './DialogoReporte.svelte'
    import {Checkbox} from 'svelte-mui'

    const dialogosStore = writable({
        dialogoAbierto: "ninguno",
        hiloId: "",
        comentarioId: "",
        comentariosIds: [],
        usuarioId: "",
        mediaId:"",
        eliminarMedia: false,
        mediaEliminarDependientes: true
    })
    

    function abrirReporte(hiloId, comentarioId=null) {
        dialogosStore.update(s => {
            s.dialogoAbierto = "reporte"
            s.hiloId = hiloId
            s.comentarioId = comentarioId
            return s
        })
    }

    function abrirEliminarhilo(hiloId, comentarioId=null) {
        dialogosStore.update(s => {
            s.dialogoAbierto = "eliminarHilo"
            s.hiloId = hiloId
            s.comentarioId = comentarioId
            return s
        })
    }
    function abrirRestaurarHilo(hiloId, comentarioId=null) {
        dialogosStore.update(s => {
            s.dialogoAbierto = "restaurarHilo"
            s.hiloId = hiloId
            return s
        })
    }
    function abrirRestaurarComentario(hiloId, comentarioId=null) {
        dialogosStore.update(s => {
            s.dialogoAbierto = "restaurarComentario"
            s.hiloId = hiloId
            s.comentarioId = comentarioId
            return s
        })
    }

    function abrirEliminarComentarios(ids) {
        dialogosStore.update(s => {
            s.dialogoAbierto = "eliminarComentarios"
            s.comentariosIds = ids
            return s
        })
    }
    function abrirBan(hiloId, comentarioId=null, usuarioId =null,) {
        dialogosStore.update(s => {
            s.dialogoAbierto = "ban"
            s.hiloId = hiloId
            s.comentarioId = comentarioId
            s.usuarioId = usuarioId
            return s
        })
    }
    function abrirEliminarMedia(mediaId) {
        dialogosStore.update(s => {
            s.dialogoAbierto = "eliminarMedia"
            s.mediaId = mediaId
            return s
        })
    }

    export const abrir = {
        //  sticky : abrirDialogo("sticky"),
         ban : abrirBan,
         reporte : abrirReporte,
         eliminarHilo: abrirEliminarhilo,
         eliminarComentarios: abrirEliminarComentarios,
         restaurarHilo: abrirRestaurarHilo,
         restaurarComentario: abrirRestaurarComentario,
         eliminarMedia: abrirEliminarMedia,
        //  categoria : abrirDialogo("categoria"),
        //  eliminar : abrirDialogo("eliminar"),
    }
</script>

{#if $dialogosStore.dialogoAbierto == "sticky"}
    <h1>sticky</h1>
{/if}
<DialogoReporte visible={$dialogosStore.dialogoAbierto == "reporte"} 
    hiloId = {$dialogosStore.hiloId} 
    comentarioId = {$dialogosStore.comentarioId}/>

<Dialogo visible={$dialogosStore.dialogoAbierto == "eliminarHilo"} 
    textoActivador="Eliminar" 
    titulo="Eliminar roz" 
    accion = {() => RChanClient.borrarHilos([$dialogosStore.hiloId], $dialogosStore.eliminarMedia)}
    >
    <span slot="activador"></span>
    <div slot="body">
        ¿Estas seguro de que queres domar el roz?
        <Checkbox bind:checked={$dialogosStore.eliminarMedia} right>Eliminar Archivos</Checkbox>
    </div>
</Dialogo>

<Dialogo visible={$dialogosStore.dialogoAbierto == "restaurarHilo"} 
    textoActivador="Restaurar" 
    titulo="Restaurar el roz" 
    accion = {() => RChanClient.restaurarRoz($dialogosStore.hiloId)}
    >
    <span slot="activador"></span>
    <div slot="body">
        ¿Estas seguro de que queres restaurar el roz?
    </div>
</Dialogo>
<Dialogo visible={$dialogosStore.dialogoAbierto == "restaurarComentario"} 
    textoActivador="Restaurar" 
    titulo="Restaurar el comentario" 
    accion = {() => RChanClient.restaurarComentario($dialogosStore.hiloId, $dialogosStore.comentarioId)}
    >
    <span slot="activador"></span>
    <div slot="body">
        ¿Estas seguro de que queres restaurar el comentario {$dialogosStore.comentarioId}?
    </div>
</Dialogo>

<Dialogo visible={$dialogosStore.dialogoAbierto == "eliminarComentarios"} 
    textoActivador="Eliminar" 
    titulo="Eliminar comentario" 
    accion = {() => RChanClient.eliminarComentarios($dialogosStore.comentariosIds, $dialogosStore.eliminarMedia)}
    >
    <span slot="activador"></span>
    <div slot="body">
        ¿Estas seguro de que queres borrar los comentarios {$dialogosStore.comentariosIds}
        <Checkbox bind:checked={$dialogosStore.eliminarMedia} right>Eliminar Archivos</Checkbox>
    </div>
</Dialogo>

<DialogoBan visible={$dialogosStore.dialogoAbierto == "ban"} 
    hiloId = {$dialogosStore.hiloId} 
    usuarioId = {$dialogosStore.usuarioId} 
    comentarioId = {$dialogosStore.comentarioId}/>

<Dialogo visible={$dialogosStore.dialogoAbierto == "eliminarMedia"} 
    textoActivador="Eliminar" 
    titulo="Eliminar la imagen/video" 
    accion = {() => RChanClient.eliminarMedia($dialogosStore.mediaId)}
    >
    <span slot="activador"></span>
    <div slot="body">
        <Checkbox bind:checked={$dialogosStore.mediaEliminarDependientes} right>Eliminar todos los elementos con este archivo?</Checkbox>
    </div>
</Dialogo>