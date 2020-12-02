<script>
    import { onDestroy } from 'svelte';

    import {Dialog, Button, Checkbox} from 'svelte-mui'

    export let visible = true

    // Configuracion por defecto
    let config = {
        fondoAburrido: false,
        colorFondo: "#101923",
        usarImagen: false,
        imagen:"/imagenes/rosed.png",
        modoCover: true
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
        window.localStorage.setItem("ajustes", JSON.stringify(config))
        if(!config.fondoAburrido) {
            document.body.style["backgroundImage"] = `url(/imagenes/rosed.png)`
            return
        }
        if(config.usarImagen) {
            document.body.style["backgroundImage"] = `url(${config.imagen})`
        }
        else {
            document.body.style["backgroundColor"] = config.colorFondo
        }
        if(config.modoCover) {
            document.body.style.backgroundSize = 'cover'
        }
        document.body.style.backgroundAttachment = 'fixed'
    }

    function actualizarYCerrar(params) {
        console.log(config.fondoAburrido)
        actualizarConfiguracion()
        visible = false
    }
</script>

<Dialog width="320" bind:visible={visible}>
    <div slot="title">Ajustes</div>
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
    
    <div slot="actions" class="actions center">
        <Button color="primary" on:click={actualizarYCerrar}>Lito</Button>
    </div>
</Dialog>


<style>
    .colorpicker {
        height: 25px;
        width: 23px;
        padding: 0;
        margin-left: auto;
        margin-right: 8px;
    }
</style>