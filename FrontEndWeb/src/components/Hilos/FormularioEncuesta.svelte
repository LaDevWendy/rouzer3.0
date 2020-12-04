<script>
    import {Checkbox, Dialog, Button, Ripple} from 'svelte-mui'
    let visible = true
    let estado = 0 // 0 sin encuesta, 1 agregando encuesnta 2 encuesta agregada
    
    const limiteOpciones = 6
    let   opciones = new Set([])
    let opcionNueva = ""

 

    function agregarOpcion() {
        if(opciones.size >= 6) return;
        opciones.add(opcionNueva)
        opciones = opciones
        opcionNueva = "" 
    }
    function remover(opcion) {
        opciones.delete(opcion)
        opciones = opciones
    }

    function cancelar() {
        opciones = new Set()
        estado = 0
    }
</script>

<!-- <Checkbox bind:checked={visible}>Encuesta</Checkbox> -->
<span style="margin:4px 0">

    {#if estado == 0  || estado == 1}
    <Button on:click={() => estado = 1}>Agregar Encuesta</Button>
    {/if}
    {#if estado == 2}
    <Button on:click={() => estado = 0}>Remover Encuesta</Button>
    {/if}
</span>

<Dialog visible={estado == 1}>
    <div slot="title">Opciones ({opciones.size}/{limiteOpciones})</div>
    <ul>
        {#each [...opciones] as o}
            <li on:click={() => remover(o)}>{o} <Ripple/></li>
        {/each}
    </ul>
    {#if opciones.size < 6}
        <input bind:value={opcionNueva} type="text" placeholder="Añadir opcion">
    {/if}
    <div style="margin-top:8px">
        {#if opciones.size > 1}
        <Button on:click={(() => estado = 2)} color="primary">Aceptar</Button>
        {:else}
        <Button color="primary" on:click={cancelar}>Cancelar</Button>
        {/if}
        {#if opciones.size < 6}
            <Button color="primary" on:click={agregarOpcion}>Añadir</Button>
        {/if}
    </div>
</Dialog>

<style>
    li {
        user-select: none;
        cursor: pointer;
        padding: 10p;
        padding: 8px 4px;
        border-bottom: dashed 1px var(--color7);
    }

    li:hover {
        background-color: rgba(255, 0, 0, 0.308);
    }
</style>

