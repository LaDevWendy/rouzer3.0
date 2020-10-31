<script context="module">
    import {writable} from 'svelte/store'
    import RChanClient from '../../RChanClient';
    import Dialogo from '../Dialogo.svelte'
    import DialogoReporte from './DialogoReporte.svelte'

    const dialogosStore = writable({
        dialogoAbierto: "ninguno",
        hiloId: "",
        comentarioId: "",
    })
    

    function abrirReporte(hiloId, comentarioId="") {
        dialogosStore.update(s => {
            s.dialogoAbierto = "reporte"
            s.hiloId = hiloId
            s.comentarioId = comentarioId
            return s
        })
    }

    function abrirEliminarhilo(hiloId, comentarioId="") {
        dialogosStore.update(s => {
            s.dialogoAbierto = "eliminarHilo"
            s.hiloId = hiloId
            s.comentarioId = comentarioId
            return s
        })
    }

    export const abrir = {
        //  sticky : abrirDialogo("sticky"),
         reporte : abrirReporte,
         eliminarHilo: abrirEliminarhilo
        //  categoria : abrirDialogo("categoria"),
        //  eliminar : abrirDialogo("eliminar"),
    }
</script>

{#if $dialogosStore.dialogoAbierto == "sticky"}
    <h1>sticky</h1>
{/if}
<DialogoReporte visible={$dialogosStore.dialogoAbierto == "reporte"} hiloId = {$dialogosStore.hiloId} comentarioId = {$dialogosStore.comentarioId}/>

<Dialogo visible={$dialogosStore.dialogoAbierto == "eliminarHilo"} 
    textoActivador="Eliminar" 
    titulo="Eliminar hilo" 
    accion = {() => RChanClient.borrarHilo($dialogosStore.hiloId)}
    >
    <span slot="activador"></span>
    <div slot="body">
        ¿Estas seguro de que queres domar el hilo?
    </div>
</Dialogo>