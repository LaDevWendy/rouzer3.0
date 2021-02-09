<script>
    import { TipoAccion, MotivoDenuncia } from "../../enums";
    import { Button } from "svelte-mui";
    import Comentario from "../Comentarios/Comentario.svelte";
    import HiloPreviewMod from "../Moderacion/HiloPreviewMod.svelte";
    import Denuncia from "../Denuncia.svelte";
    import { formatearTiempo, formatearTimeSpan } from "../../helper";
    import Dialogo from "../Dialogo.svelte";
    import RChanClient from "../../RChanClient";
    import Tiempo from "../Tiempo.svelte";
    import BarraModeracion from "../Moderacion/BarraModeracion.svelte";
    import BanPreview from "../Moderacion/BanPreview.svelte";

    const historial = window.model.acciones;

    let dialogoDesban = false;

    let filtro = {
        usuario: "",
        accion: "",
    };

    $: accionesFiltradas =
        historial.filter((a) => {
            let fUsuario =
                !filtro.usuario || a.usuario.userName == filtro.usuario;
            let fAccion = filtro.accion === "" || a.tipo === filtro.accion;
            return fUsuario && fAccion;
        }) || filtro;

    let mods = Array.from(new Set(historial.map((a) => a.usuario.userName)));

    let accionVista = null;
</script>

<style>
    .desplegable {
        display: none;
        z-index: 99;
    }
    a {
        position: relative;
    }
    a:hover .desplegable,
    a:active .desplegable {
        display: block;
        max-width: 600px;
        width: max-content;
        position: absolute;
        top: 15px;
        left: 20px;
    }
    .roz {
        width: 300px !important;
        height: 300px !important;
    }

    ul {
        display: flex;
        flex-direction: column;
        width: fit-content;
        gap: 10px;
    }
    li {
        gap: 0;
    }
    .accion > * {
        padding: 4px 10px;
        display: block;
        min-width: 57px;
    }
    .accion {
        background: var(--color1);
        border-radius: 4px;
        display: flex;
        flex-direction: row;
        gap: 4px;
        background: var(--color7);
    }

    .container {
        display: flex;
        margin: 0 auto;
        width: fit-content;
    }
    .vista-previa {
        width: 500px;
        height: 100%;
        position: sticky;
        top: 60px;
    }
</style>

<main>
    <BarraModeracion />
    <h3 style="text-align:center;margin-bottom: 10px;">Ultimas acciones</h3>
    <div
        class="filtros"
        style="display: flex;width: fit-content;margin: 0 auto;align-items: baseline;">
        <span>Filtrar: </span>
        <select bind:value={filtro.usuario}>
            <option value={''}>Usuario</option>
            {#each mods as m}
                <option value={m}>{m}</option>
            {/each}
        </select>

        <select bind:value={filtro.accion}>
            <option value={''}>Accion</option>
            {#each Object.keys(TipoAccion) as a}
                <option value={TipoAccion[a]}>{a}</option>
            {/each}
        </select>
    </div>
    <div class="container">
            <ul>
                {#each accionesFiltradas as a (a.id)}
                    <li class="accion" on:mouseenter={() => accionVista = a}
                        style="{a == accionVista?'background: var(--color6);':''}"
                        >
                        <span style="background: var(--color3);">
                            <Tiempo date={a.creacion} />
                        </span>
                        <span
                            style="background: var(--color6);">{a.usuario.userName}</span>
                        <span
                            style="background: var(--color5);">{TipoAccion.aString(a.tipo)}</span>
                        {#if a.tipo == TipoAccion.CategoriaCambiada}
                            <span>{a.nota}</span>
                        {/if}
                        {#if a.hilo}
                            <a href="/Hilo/{a.hilo.id}">{a.hilo.titulo}</a>
                        {/if}
                        <!-- {#if a.comentario}
                            <a href="/Hilo/{a.comentario.hiloId}#{a.comentario.id}"> Comentario</a>
                        {/if}
                        {#if a.denuncia}
                            <a href="#">  Denuncia</a>
                        {/if}
                        {#if a.ban}
                            <a href="#" style="background: var(--color5);"> Ban </a>
                        {/if} -->
                    </li>
                {/each}
            </ul>
        
            <div class="vista-previa panel">
                {#if accionVista != null }
                {#key accionVista}
                    {#if accionVista.tipo == TipoAccion.CategoriaCambiada}
                        <span>{accionVista.nota}</span>
                    {/if}
                    {#if accionVista.hilo}
                        <HiloPreviewMod hilo={accionVista.hilo} />
                    {/if}
                    {#if accionVista.comentario}
                        <Comentario comentario={accionVista.comentario} />
                    {/if}
                    {#if accionVista.denuncia}
                        <Denuncia denuncia={accionVista.denuncia} />
                    {/if}
                    {#if accionVista.ban}
                        <BanPreview ban={accionVista.ban} />
                        <Dialogo
                            textoActivador="Desbanear"
                            titulo="Desbanear gordo"
                            accion={() => RChanClient.removerBan(accionVista.ban.id)}>
                            <span slot="activador" style="display:flex;justify-content:center;"> <Button>Desbanear</Button></span>
                            <div slot="body">Remover ban?</div>
                        </Dialogo>
                    {/if}
                {/key}
                {/if}
            </div>
    </div>
</main>
