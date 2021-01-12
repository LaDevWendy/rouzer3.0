<script>
    import {Dialog, Button, Checkbox, ExpansionPanel, Ripple} from 'svelte-mui'
    import {localStore} from '../../localStore'
import Skins from '../Personalizacion/Skins.svelte'

    export let visible = true

    // Configuracion por defecto
    let config = {
        fondoAburrido: false,
        colorFondo: "#101923",
        usarImagen: false,
        imagen:"/imagenes/rosed.png",
        modoCover: true,
        scrollAncho: false
    }

    // Cargo configuracion gudardada
    let configGuardada = window.localStorage.getItem("ajustes")
    
    if(configGuardada){
        try {
            config = Object.assign(config, JSON.parse(configGuardada))
        } catch (error) {
            console.log(error);
        }
    }
    

    $: if(config) actualizarConfiguracion()

    setTimeout(actualizarConfiguracion, 1)
    function actualizarConfiguracion() {
        //Guardo config
        let css = `
            body {
                ${config.usarImagen?`background-image: url(${config.imagen})`: `background:${config.colorFondo}`}!important;
                background-size:${config.modoCover?'cover':'auto'} !important;
                background-attachment: fixed !important;
            }
        `
        if(!config.fondoAburrido)
        {
            css = `
            body {
                background-image: url(/imagenes/rosed.png) !important;
                background-size:auto !important;
                background-attachment: contain !important;
            }
        `
        }
        let style = window.document.styleSheets[0];
        style.insertRule(css, style.cssRules.length)
        
        if(config.scrollAncho) {
            style.insertRule(`
            ::-webkit-scrollbar {
                width: 10px !important;
            }`,style.cssRules.length)
        }
        window.localStorage.setItem("ajustes", JSON.stringify(config))
    }

    function actualizarYCerrar(params) {
        actualizarConfiguracion()
        visible = false
    }

    let palabrasHideadas = localStore("palabrasHideadas", "")

    let group = '';

</script>
<div class="ajustes">
    <Dialog  width="500" bind:visible={visible}>
        <div slot="title">Ajustes</div>
        <ExpansionPanel bind:group name="Personalizacion">
            <Checkbox  bind:checked={config.scrollAncho} right>Scroll ancho</Checkbox>  
            <Checkbox  bind:checked={config.fondoAburrido} right>Fondo personalizado</Checkbox>
            {#if config.fondoAburrido}
                <Checkbox  bind:checked={config.usarImagen} right>Usar imagen</Checkbox>
                {/if}
                {#if config.fondoAburrido && !config.usarImagen}
                <div style="display:flex"> 
                    <label  for="color">Color:</label>  
                    <input bind:value={config.colorFondo}  class="colorpicker" type="color" name="color">
                </div>
                {/if}
                {#if config.fondoAburrido && config.usarImagen}
                <div style="display:flex;align-items: baseline;gap: 10px;">
                    <label  for="imagen">Imagen:</label>  
                    <input style="background: var(--color4);" bind:value={config.imagen}  type="text" name="imagen">
                </div>
                <Checkbox  bind:checked={config.modoCover} right>Modo Cover</Checkbox>
            {/if}
        </ExpansionPanel>
    
        <ExpansionPanel bind:group name="Auto censura">
            <textarea 
                style=" background: var(--color3);" 
                spellcheck="false"
                bind:value={$palabrasHideadas}
                placeholder="Podes usar palabras y frases(palabras separadas guion bajo en vez de espacios). Ej sidoca huele tengo_un_video minubi insta se_le_da, etc"
                cols="30" rows="10"></textarea>
        </ExpansionPanel>
        <ExpansionPanel bind:group name="Skins">
           <Skins/>
        </ExpansionPanel>
        
        <div slot="actions" class="actions center">
            <Button color="primary" on:click={actualizarYCerrar}>Lito</Button>
        </div>
    </Dialog>
</div>


<style>
    .colorpicker {
        height: 25px;
        width: 23px;
        padding: 0;
        margin-left: auto;
        margin-right: 8px;
    }
    .ajustes :global( .content .panel) {
        padding: 0;
        box-shadow: none !important;
        background: #0a10176b !important;
    }

    .ajustes :global(.content ) {
        padding: 0px 8px;
    }
</style>