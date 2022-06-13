<script>
    import { createEventDispatcher } from "svelte";
    import { Button, Checkbox } from "svelte-mui";
    //import comentarioStore from "./comentarioStore";
    import RChanClient from "../../RChanClient";
    import ErrorValidacion from "../ErrorValidacion.svelte";
    import MediaInput from "../MediaInput.svelte";
    import Spinner from "../Spinner.svelte";
    import config from "../../config";
    import globalStore from "../../globalStore";
    // import AudioInput from "../AudioInput.svelte";
    import { fpPromise } from "../../fingerprint";
    // import ajustesConfigStore from "../Dialogos/ajustesConfigStore";

    let dispatch = createEventDispatcher();

    export let hilo;
    export let comentarioStore;

    let cargando = false;
    let captcha = "";

    // $comentarioStore;
    let media;
    let mediaInput;
    let audio = null;
    //let audioInput;

    let mostrarRango = false;
    let mostrarRangoAdmin = false;
    let mostrarRangoDev = false;
    let mostrarNombre = false;

    //const risas = new Audio("/audio/risas.mp3");

    let espera = 0;
    $: if (espera != 0) {
        setTimeout(() => espera--, 1000);
    }
    let error = null;
    export let hide_flag;
    export let hide;
    async function crearComentario() {
        if (espera != 0 || cargando) return;

        try {
            cargando = true;
            var comentarioConFlag = comentarioStore;
            if (comentarioConFlag != "") {
                comentarioConFlag += "\n";
            }
            comentarioConFlag += hide_flag ? ">hide\n" : "";
            if (!hide) {
                if (hide_flag) {
                    await RChanClient.agregar("ocultos", hilo.id);
                }
                hide = hide_flag;
            }
            let result = await (await fpPromise).get();
            if (
                $globalStore.usuario.esMod ||
                ($globalStore.usuario.esAuxiliar && config.general.modoSerenito)
            ) {
                await RChanClient.crearComentario(
                    hilo.id,
                    comentarioConFlag,
                    result.visitorId,
                    media.archivo,
                    media.link,
                    audio,
                    "",
                    spoiler,
                    mostrarNombre && $globalStore.usuario.esAdmin,
                    mostrarRango,
                    mostrarRangoAdmin,
                    mostrarRangoDev
                );
            } else {
                await RChanClient.crearComentario(
                    hilo.id,
                    comentarioConFlag,
                    result.visitorId,
                    media.archivo,
                    media.link,
                    audio,
                    captcha,
                    spoiler
                );
            }
            /*if (!$ajustesConfigStore.mutearRisas) {
                risas.play();
            }*/
            if (!$globalStore.usuario.esMod) {
                espera = config.general.tiempoEntreComentarios;
            }
            if (hide_flag) {
                hide_flag = false;
            }
            mediaInput.removerArchivo();
            //if (hilo.audios) audioInput.removerArchivo();
            dispatch("comentarioCreado");
        } catch (e) {
            error = e.response.data;
            cargando = false;
            return;
        }

        cargando = false;
        comentarioStore = "";
        media.archivo = null;
        error = null;
        spoiler = false;
    }

    function onFocus() {
        error = null;
        if (!$globalStore.usuario.estaAutenticado) {
            window.location = "/Inicio";
        }
    }

    let spoiler = false;
</script>

<form
    on:submit|preventDefault
    id="form-comentario"
    class="form-comentario panel"
    on:blur={() => (focus = false)}
>
    <ErrorValidacion {error} />
    <MediaInput
        bind:this={mediaInput}
        bind:spoiler
        bind:media
        compacto={true}
    />
    <!--{#if hilo.audios}
        <AudioInput bind:this={audioInput} bind:blobAudio={audio} />
    {/if}-->
    <textarea
        on:focus={onFocus}
        bind:value={comentarioStore}
        cols="30"
        rows="3"
        placeholder="Que dificil discutir con pibes..."
    />

    <div class="acciones">
        <div style=" flex-direction:row; display:flex; flex-wrap: wrap;">
            <span style="width: fit-content;margin-right: auto;"
                ><Checkbox bind:checked={hide_flag} right>Hide</Checkbox></span
            >
        </div>
        {#if $globalStore.usuario.esMod || ($globalStore.usuario.esAuxiliar && config.general.modoSerenito)}
            <div style=" flex-direction:row; display:flex; flex-wrap: wrap;">
                <span style="width: fit-content;margin-right: auto;"
                    ><Checkbox bind:checked={mostrarRango} right
                        >Lucesitas</Checkbox
                    ></span
                >
                {#if $globalStore.usuario.esAdmin}
                    <span style="width: fit-content;margin-right: auto;"
                        ><Checkbox bind:checked={mostrarRangoAdmin} right
                            >Admin</Checkbox
                        ></span
                    >
                    {#if $globalStore.usuario.esDev}
                        <span style="width: fit-content;margin-right: auto;"
                            ><Checkbox bind:checked={mostrarRangoDev} right
                                >Dev</Checkbox
                            ></span
                        >
                    {/if}
                    <span style="width: fit-content;margin-right: auto;"
                        ><Checkbox bind:checked={mostrarNombre} right
                            >Nombre</Checkbox
                        ></span
                    >
                {/if}
            </div>
        {/if}
        <Button
            disabled={cargando}
            color="primary"
            class="mra"
            on:click={crearComentario}
        >
            <Spinner {cargando}>{espera == 0 ? "Responder" : espera}</Spinner>
        </Button>
    </div>
</form>

<style>
    .acciones :global(.mra) {
        margin-left: auto;
    }
    .acciones :global(i) {
        margin: 0 !important;
    }
    .form-comentario :global(.media-input) {
        margin-left: 0;
    }
</style>
