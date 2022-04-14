<script>
    import ErrorValidacion from "./ErrorValidacion.svelte";
    import { Dialog, Button } from "svelte-mui";
    import Spinner from "./Spinner.svelte";
    import { onDestroy } from "svelte";

    export let titulo = "Accion";
    export let accion = () => console.log("Accionado");
    export let visible = false;
    export let textoActivador = "Accion";

    let exito = false;
    let respuesta = null;
    let cargando = false;

    async function ejecutarAccion() {
        if (cargando) return;
        cargando = true;
        try {
            error = null;
            respuesta = (await accion()).data;
            exito = true;
            setTimeout(() => {
                cargando = false;
                visible = false;
            }, 1000);
        } catch (e) {
            console.log(e.response.data);
            exito = false;
            error = e.response.data;
            cargando = false;
        }
    }

    let error = null;

    onDestroy(() => {
        respuesta = null;
        error = null;
    });
    $: if (visible == false) {
        respuesta = null;
        error = null;
        exito = false;
    }
</script>

<span on:click={() => (visible = true)}>
    <slot name="activador">
        <Button>{textoActivador}</Button>
    </slot>
</span>

<Dialog width="320" bind:visible>
    <div slot="title">{titulo}</div>
    <ErrorValidacion {error} />

    {#if exito}
        <p class="exito">{respuesta.mensaje}</p>
    {/if}

    <slot name="body" />

    <div slot="actions" class="actions center">
        <Button
            disabled={cargando}
            color="primary"
            on:click={() => {
                cargando = false;
                visible = false;
            }}>Cancelar</Button
        >
        <Button disabled={cargando} color="primary" on:click={ejecutarAccion}
            ><Spinner {cargando}>Aceptar</Spinner></Button
        >
    </div>
</Dialog>

<style>
    :global(label .label-text) {
        white-space: break-spaces !important;
    }
</style>
