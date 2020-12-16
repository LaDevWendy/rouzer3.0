<script>
    import { TipoAccion, MotivoDenuncia } from '../../enums';
    import { Button } from 'svelte-mui'
    import Comentario from '../Comentarios/Comentario.svelte'
    import HiloPreviewMod from '../Moderacion/HiloPreviewMod.svelte'
    import Denuncia from '../Denuncia.svelte'
    import {formatearTiempo, formatearTimeSpan} from '../../helper'
    import Dialogo from '../Dialogo.svelte'
    import RChanClient from '../../RChanClient';
    import Tiempo from '../Tiempo.svelte'
    import BarraModeracion from '../Moderacion/BarraModeracion.svelte';
    
    const historial = window.model.acciones

    let dialogoDesban = false
</script>
<main>
    <BarraModeracion/>
    <h3 style="text-align:center;margin-bottom: 10px;">Ultimas acciones</h3>
    <ul>
        {#each historial as a (a.id)}
            <li class="accion">
                <span style="background: var(--color3);">
                    <Tiempo date={a.creacion}/>
                </span>
                <span style="background: var(--color6);">{a.usuario.userName}</span>
                <span style="background: var(--color5);">{TipoAccion.aString(a.tipo)}</span>
                {#if a.hilo}
                    <a href="/Hilo/{a.hilo.id}">Roz
                        <div class="desplegable roz">
                            <HiloPreviewMod hilo={a.hilo}/>
                        </div>
                    </a>
                {/if}
                {#if a.comentario}
                    <a href="/Hilo/{a.comentario.hiloId}#{a.comentario.id}">
                        Comentario
                        <div class="desplegable">
                            <Comentario comentario={a.comentario}/>
                        </div>
                    </a>
                {/if}
                {#if a.denuncia}
                    <a href="#">
                        Denuncia
                        <div class="desplegable">
                            <Denuncia denuncia = {a.denuncia}></Denuncia>
                        </div>
                    </a>
                {/if}
                {#if a.ban}
                    <a href="#" style="background: var(--color5);">
                        Ban
                        <div class="desplegable">
                            <div class="ban">
                                <p>Aclaracion {a.ban.aclaracion ||" "}</p>
                                <p>Motivo: { MotivoDenuncia.aString(a.ban.motivo)}</p>
                                <p>Fecha: {formatearTiempo(a.ban.creacion)}</p>
                                <p>Duracion: {formatearTimeSpan(a.ban.duracion)}</p>
                                <p>Id del ban: {a.ban.id}</p>
                                
                            </div>
                        </div>
                        <Dialogo textoActivador="Desbanear" titulo="Desbanear gordo" accion = {() => RChanClient.removerBan(a.ban.id)}>
                            <span slot="activador">desbanear</span>
                            <div slot="body">
                                Remover ban?
                            </div>
                        </Dialogo>
                    </a>
                {/if}
            </li>
        {/each}
    </ul>
</main>

<style>
    .desplegable {
        display: none;
        z-index: 99;
    }
    a {
        position: relative;
    }
    a:hover .desplegable, a:active .desplegable {
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
        gap:10px;
        margin:auto
    }
    li {
        gap: 0;
    }
    .accion > *{
        padding: 4px 10px;
        display: block;
        min-width: 57px;
    }
    .accion {
        background: var(--color1);
        border-radius: 4px;
        display:flex;
        flex-direction: row;
        gap: 4px;
        background: var(--color7);
    }
    .ban {
        background: var(--color5);
        padding: 4px 10px;
        border-radius: 13px;
    }
</style>