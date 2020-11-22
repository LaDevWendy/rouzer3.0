<script context="module">
    import {writable} from 'svelte/store'
    import RChanClient from '../../RChanClient';
    import Dialogo from '../Dialogo.svelte'
    import DialogoBan from './DialogoBan.svelte';
    import DialogoReporte from './DialogoReporte.svelte'

    const dialogosStore = writable({
        dialogoAbierto: "ninguno",
        hiloId: "",
        comentarioId: "",
        comentariosIds: [],
        usuarioId: "",
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

    export const abrir = {
        //  sticky : abrirDialogo("sticky"),
         ban : abrirBan,
         reporte : abrirReporte,
         eliminarHilo: abrirEliminarhilo,
         eliminarComentarios: abrirEliminarComentarios,
         restaurarHilo: abrirRestaurarHilo,
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
    accion = {() => RChanClient.borrarHilo($dialogosStore.hiloId)}
    >
    <span slot="activador"></span>
    <div slot="body">
        ¿Estas seguro de que queres domar el roz?
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

<Dialogo visible={$dialogosStore.dialogoAbierto == "eliminarComentarios"} 
    textoActivador="Eliminar" 
    titulo="Eliminar hilo" 
    accion = {() => RChanClient.eliminarComentarios($dialogosStore.comentariosIds)}
    >
    <span slot="activador"></span>
    <div slot="body">
        ¿Estas seguro de que queres borrar los comentarios {$dialogosStore.comentariosIds}
    </div>
</Dialogo>

<DialogoBan visible={$dialogosStore.dialogoAbierto == "ban"} 
    hiloId = {$dialogosStore.hiloId} 
    usuarioId = {$dialogosStore.usuarioId} 
    comentarioId = {$dialogosStore.comentarioId}/>