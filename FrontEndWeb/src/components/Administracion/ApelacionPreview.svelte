<script>
    import BanPreview from "../Moderacion/BanPreview.svelte";
    import Tiempo from "../Tiempo.svelte";
    import { ApelacionEstado } from "../../enums";
    import { Button } from "svelte-mui";
    import RChanClient from "../../RChanClient";
    import ErrorValidacion from "../ErrorValidacion.svelte";

    export let apelacion;

    let exito = false;
    let respuesta = null;
    let error = null;

    $: aceptada = apelacion.estado == ApelacionEstado.Aceptada;
    $: rechazada = apelacion.estado == ApelacionEstado.Rechazada;

    async function aceptar() {
        try {
            error = null;
            respuesta = (await RChanClient.aceptarApelacion(apelacion.id)).data;
            exito = true;
            if (apelacion.estado == ApelacionEstado.Pendiente) {
                apelacion.estado = ApelacionEstado.Aceptada;
            }
        } catch (e) {
            console.log(e.response.data);
            exito = false;
            error = e.response.data;
        }
    }

    async function rechazar() {
        try {
            error = null;
            respuesta = (await RChanClient.rechazarApelacion(apelacion.id))
                .data;
            exito = true;
            if (apelacion.estado == ApelacionEstado.Pendiente) {
                apelacion.estado = ApelacionEstado.Rechazada;
            }
        } catch (e) {
            console.log(e.response.data);
            exito = false;
            error = e.response.data;
        }
    }
</script>

<div class="apelacion" class:rechazada class:aceptada>
    <div class="header">
        <span class="tiempo">
            <Tiempo date={apelacion.creacion} />
        </span>
        <a
            class="userlink"
            href="/Moderacion/HistorialDeUsuario/{apelacion.usuario.id}"
            >{apelacion.usuario.userName}</a
        >
        apela al ban y sus argumentos son:
        <p>{apelacion.descripcion}</p>
    </div>
    <div class="body">
        <ErrorValidacion {error} />
        {#if exito}
            <p class="exito">{respuesta.mensaje}</p>
        {/if}
        <div class="botones">
            <Button raised color="rgb(54, 153, 45)" on:click={aceptar}
                >Aceptar</Button
            >
            <Button raised color="grey" on:click={rechazar}>Rechazar</Button>
        </div>
        <BanPreview ban={apelacion.ban} />
    </div>
</div>

<style>
    .header {
        padding: 8px;
        overflow: auto;
    }
    .header .tiempo {
        background: var(--color2);
        padding: 2px;
        border-radius: 4px;
    }
    .header p {
        background-color: var(--color4);
        border-radius: 4px;
        line-height: 1.5em;
        min-height: 4.5em;
    }
    .apelacion {
        position: relative;
        background: rgba(18, 18, 116, 0.315);
        margin-bottom: 16px;
        border-radius: 4px;
    }
    .userlink {
        background: var(--color6);
        color: black;
        padding: 2px 8px;
        border-radius: 4px;
    }
    .userlink:hover {
        text-decoration: underline;
        filter: brightness(1.4);
    }

    .rechazada {
        background: grey;
    }
    .aceptada {
        background: rgb(54, 153, 45);
    }
    .botones {
        display: flex;
        width: 100%;
        margin: auto;
        justify-content: space-around;
        background-color: var(--color2);
        padding: 10px;
    }
</style>
