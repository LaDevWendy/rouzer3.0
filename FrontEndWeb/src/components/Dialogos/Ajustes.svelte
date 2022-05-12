<script>
    import { Dialog, Button, Checkbox, ExpansionPanel } from "svelte-mui";
    import globalStore from "../../globalStore";
    import Skins from "../Personalizacion/Skins.svelte";
    import ajustesConfigStore from "./ajustesConfigStore";
    import ajustesConfigModStore from "./ajustesConfigModStore";

    export let visible = true;

    $: if ($ajustesConfigStore) actualizarConfiguracion();

    setTimeout(actualizarConfiguracion, 1);
    function actualizarConfiguracion() {
        let css = `
            #fondo-global {
                ${
                    $ajustesConfigStore.usarImagen
                        ? `background-image: url(${$ajustesConfigStore.imagen})`
                        : `background:${$ajustesConfigStore.colorFondo}`
                };
                background-size:${
                    $ajustesConfigStore.modoCover ? "cover" : "auto"
                } ;
            }
        `;
        if (!$ajustesConfigStore.fondoAburrido) {
            css = `
            #fondo-global {
                background-image: url(/imagenes/rosed.png) ;
                background-size:auto ;
            }
        `;
        }
        let style = window.document.styleSheets[0];
        style.insertRule(css, style.cssRules.length);

        if ($ajustesConfigStore.scrollAncho) {
            style.insertRule(
                `
            ::-webkit-scrollbar {
                width: 10px !important;
            }`,
                style.cssRules.length
            );
        }
        if ($ajustesConfigStore.usarColorPersonalizado) {
            style.insertRule(
                `
            body {
                --color5: ${$ajustesConfigStore.colorPersonalizado} !important;
            }`,
                style.cssRules.length
            );
        }
    }

    function actualizarYCerrar() {
        actualizarConfiguracion();
        visible = false;
    }

    let group = "";
</script>

<div class="ajustes">
    <Dialog width="500" bind:visible>
        <div slot="title">Ajustes</div>
        <ExpansionPanel bind:group name="Personalizacion">
            <Checkbox bind:checked={$ajustesConfigStore.scrollAncho} right
                >Scroll ancho</Checkbox
            >
            <Checkbox bind:checked={$ajustesConfigStore.tagClasico} right
                >Tag clásico</Checkbox
            >
            <Checkbox bind:checked={$ajustesConfigStore.catClasicas} right
                >Categorías clásicas</Checkbox
            >
            <hr />
            <Checkbox bind:checked={$ajustesConfigStore.fondoAburrido} right
                >Fondo personalizado</Checkbox
            >
            {#if $ajustesConfigStore.fondoAburrido}
                <Checkbox bind:checked={$ajustesConfigStore.usarImagen} right
                    >Usar imagen</Checkbox
                >
            {/if}
            {#if $ajustesConfigStore.fondoAburrido && !$ajustesConfigStore.usarImagen}
                <div style="display:flex">
                    <label for="color-fondo">Color Fondo:</label>
                    <input
                        bind:value={$ajustesConfigStore.colorFondo}
                        class="colorpicker"
                        type="color"
                        name="color-fondo"
                    />
                </div>
            {/if}
            {#if $ajustesConfigStore.fondoAburrido && $ajustesConfigStore.usarImagen}
                <div style="display:flex;align-items: baseline;gap: 10px;">
                    <label for="imagen">Imagen:</label>
                    <input
                        style="background: var(--color4);"
                        bind:value={$ajustesConfigStore.imagen}
                        type="text"
                        name="imagen"
                    />
                </div>
                <Checkbox bind:checked={$ajustesConfigStore.modoCover} right
                    >Modo Cover</Checkbox
                >
            {/if}
            <hr />
            <Checkbox
                bind:checked={$ajustesConfigStore.usarColorPersonalizado}
                right>Color personalizado</Checkbox
            >
            {#if $ajustesConfigStore.usarColorPersonalizado}
                <div class="" style="display:flex">
                    <label for="">Color Personalizado: </label>
                    <input
                        class="colorpicker"
                        bind:value={$ajustesConfigStore.colorPersonalizado}
                        name="color"
                        type="color"
                    />
                </div>
            {/if}
            <!--<Checkbox
                bind:checked={$ajustesConfigStore.mutearRisas}
                right>Mutear risas</Checkbox
            >
            <Checkbox
                bind:checked={$ajustesConfigStore.desactivarCuetitos}
                right>Desactivar cuetitos</Checkbox
            >-->
            <hr />
            <div style="display:flex;align-items: baseline;gap: 10px;">
                <label for="comentarioModo">Comentarios: </label>
                <select
                    bind:value={$ajustesConfigStore.comentarioModo}
                    name="comentarioModo"
                >
                    <option value="0">Carga total</option>
                    <option value="1">Carga parcial</option>
                    <option value="2">Carga por páginas</option>
                </select>
            </div>
            <Checkbox bind:checked={$ajustesConfigStore.botoncitos} right
                >Eee dos botoncitos</Checkbox
            >
        </ExpansionPanel>

        <ExpansionPanel bind:group name="Auto censura">
            <textarea
                style=" background: var(--color3);"
                spellcheck="false"
                bind:value={$ajustesConfigStore.palabrasHideadas}
                placeholder="Podes usar palabras y frases(palabras separadas guion bajo en vez de espacios). Ej sidoca huele tengo_un_video minubi insta se_le_da, etc"
                cols="30"
                rows="10"
            />
        </ExpansionPanel>
        <ExpansionPanel bind:group name="Skins">
            <Skins />
        </ExpansionPanel>

        {#if $globalStore.usuario.esAuxiliar}
            <ExpansionPanel bind:group name="Mod">
                <label for="volumen-denuncias"
                    >Volumen denuncias: {$ajustesConfigModStore.volumenDenuncias !=
                    undefined
                        ? $ajustesConfigModStore.volumenDenuncias
                        : 0.03}</label
                >
                <input
                    name="volumen-denuncias"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    bind:value={$ajustesConfigModStore.volumenDenuncias}
                />
                <Checkbox
                    bind:checked={$ajustesConfigModStore.autoDesplegarDenuncias}
                    right>Auto desplegar denuncias</Checkbox
                >
            </ExpansionPanel>
        {/if}

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
    .ajustes :global(.content .panel) {
        padding: 0;
        box-shadow: none !important;
        background: #0a10176b !important;
    }

    .ajustes :global(.content) {
        padding: 0px 8px;
    }
    hr {
        border-color: var(--color4);
    }
</style>
