<script>
    import RChanClient from "../../RChanClient";
    import { MotivoDenuncia } from "../../enums";

    import Dialogo from "../Dialogo.svelte";
    import { Textfield, Checkbox } from "svelte-mui";
    import globalStore from "../../globalStore";

    let motivo;
    let duracion;
    let aclaracion;
    let eliminarElemento = false;
    let eliminarAdjunto = false;
    let eliminarAudio = false;
    let desaparecer = false;
    $: tipo = comentarioId == "" || !comentarioId ? 0 : 1;

    export let hiloId;
    export let comentarioId;
    export let usuarioId;
    export let visible = false;

    let password = "";
    function banear() {
        return RChanClient.banear(
            motivo,
            aclaracion,
            duracion,
            usuarioId,
            hiloId,
            comentarioId,
            eliminarElemento,
            eliminarAdjunto,
            eliminarAudio,
            desaparecer,
            password
        );
    }
</script>

<Dialogo bind:visible textoActivador="Banear" titulo="Banear" accion={banear}>
    <slot slot="activador" />
    <div slot="body">
        <div class="">
            {#if hiloId}
                Banear al usuario {usuarioId}
                por {hiloId}#{comentarioId}
            {/if}
        </div>
        <select bind:value={motivo} name="motivo">
            <option value="-1" selected disabled>Motivo</option>
            {#each Object.keys(MotivoDenuncia) as k, i}
                <option value={MotivoDenuncia[k]}>{k}</option>
            {/each}
        </select>

        <textarea placeholder="Aclaracion, mensaje" bind:value={aclaracion} />

        <select bind:value={duracion} name="duracion">
            <option value="-1" selected disabled>Duracion</option>
            <option value="0">0 min (Advertencia)</option>
            <option value="5">5 min</option>
            <option value="10">10 min</option>
            <option value="30">30 min</option>
            <option value="60">1 hora</option>
            <option value="360">6 horas</option>
            <option value="1440">1 dia</option>
            <option value="4320">3 dia</option>
            <option value="10080">1 semana</option>
            <option value="40320">1 mes</option>
            <option value="99999999">Permanente</option>
        </select>

        {#if comentarioId || hiloId}
            <Checkbox
                style="padding: 0 8px"
                bind:checked={eliminarElemento}
                right
            >
                Eliminar elemento(hilo/comentario)</Checkbox
            >
            {#if $globalStore.usuario.esMod}
                <Checkbox
                    style="padding: 0 8px"
                    title="Borra la imagen del servidor, usar en caso de cp"
                    bind:checked={eliminarAdjunto}
                    right
                >
                    Eliminar adjunto(imagen/video)</Checkbox
                >
                {#if eliminarAdjunto}
                    <Textfield
                        autocomplete="new-password"
                        label="Contraseña"
                        type="password"
                        required
                        bind:value={password}
                        message="contraseña"
                    />
                {/if}
                <!--<Checkbox
                style="padding: 0 8px"
                title="Borra el audio del servidor"
                bind:checked={eliminarAudio}
                right
            >
                Eliminar audio</Checkbox
            >-->
            {/if}
        {/if}
        {#if duracion > 5000}
            <Checkbox
                style="padding: 0 8px"
                title="Borra todos los rozes y comentarios del usuario"
                bind:checked={desaparecer}
                right
            >
                Desaparecer</Checkbox
            >
        {/if}
    </div>
</Dialogo>
