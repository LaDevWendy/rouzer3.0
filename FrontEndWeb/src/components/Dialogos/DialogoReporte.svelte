<script>
    import Dialogo from '../Dialogo.svelte'
    import globalStore from '../../globalStore'
    import RChanClient from '../../RChanClient';

    export let comentarioId = ""
    export let hiloId = ""
    $: tipo = (comentarioId == "" || !comentarioId)? 0:1

    let motivo = -1
    let aclaracion = ""
    export let  visible = false

</script>

<Dialogo 
    bind:visible={visible} 
    textoActivador="Reportar {tipo}" 
    titulo="Reportar {tipo}"
    accion={() => RChanClient.Denunciar(tipo, hiloId, motivo, aclaracion, comentarioId)}>
    <slot slot="activador">

    </slot>
    <div slot="body">
        <p>Reportar el {tipo}</p>
        <select bind:value={motivo}  name="motivo"> 
            <option value="-1" selected="selected" disabled="disabled">Motivo</option>
            {#if tipo == "hilo"}
                <option value="0">1) Categoria incorrecta</option>
            {/if}
            <option value="1">2) Spam, fload</option>
            <option value="2">3) Avatarfageo</option>
            <option value="3">4) Contiene datos personales</option>
            <option value="4">5) Contenido ilegal</option>
        </select>

        <textarea placeholder="Aclaracion"></textarea>
        
    </div>
</Dialogo>
