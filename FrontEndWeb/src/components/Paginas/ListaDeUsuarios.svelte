<script>
    import { formatearTimeSpan } from '../../helper';
    import { Button } from 'svelte-mui'
    import Tiempo from '../Tiempo.svelte'
    import Dialogo from '../Dialogo.svelte'
    import RChanClient from '../../RChanClient'
    import BarraModeracion from '../Moderacion/BarraModeracion.svelte';

    import Comentario from "../Comentarios/Comentario.svelte";
    import HiloPreviewMod from "../Moderacion/HiloPreviewMod.svelte";
    import Denuncia from "../Denuncia.svelte";
    import BanPreview from "../Moderacion/BanPreview.svelte";

    let ultimosRegistros = window.model.ultimosRegistros
    let ultimosBaneos = window.model.ultimosBaneos
    let cantidadDeUsuarios = window.model.cantidadDeUsuarios

    let banVisto = null
</script>

<BarraModeracion/>
<section>
    <div class="lista-baneos panel">
        <h2>Baneos activos</h2>
        <ul>
            {#each ultimosBaneos as b}    
            <!-- <li class="ban" >
                <a 
                style="color:var(--color6)" 
                    href="/Moderacion/HistorialDeUsuario/{b.usuario.id}">
                    {b.usuario.userName}</a>
                    fue baneado hace <Tiempo date={b.creacion}/> <br>
                    <a style="color:var(--color6)" href="/Hilo/{b.hiloId}#{b.comentarioId}">roz/comentario del baneo</a>
                    Duracion: {formatearTimeSpan(b.duracion)}
                    <br>
                    <Dialogo textoActivador="Desbanear" titulo="Desbanear gordo" accion = {() => RChanClient.removerBan(b.id)}>
                        <div slot="body">
                            Remover ban?
                        </div>
                    </Dialogo>
                </li> -->
                <li class="accion" on:mouseenter={() => banVisto = b}
                    style="{b == banVisto?'background: var(--color6);':''}"
                    >
                    <a href="/Moderacion/HistorialDeUsuario/{b.modId}" style="background: var(--color3)">Mod</a>
                    <span style="background: var(--color3);">
                        <Tiempo date={b.creacion} />
                    </span>
                    <span style="background: var(--color3);">
                        {formatearTimeSpan(b.duracion).includes('69444D ')?'Perma':formatearTimeSpan(b.duracion)}
                    </span>
                    <!-- <span style="background: var(--color6);">{a.usuario.userName}</span> -->
                    {#if b.hilo}
                        <a href="/Hilo/{b.hilo.id}">{b.hilo.titulo}</a>
                    {/if}
                </li>
                {/each}
            </ul>
        </div>

        <div class="vista-previa panel">
            {#if banVisto != null }
                {#key banVisto}
                    <BanPreview ban={banVisto} />
                    <Dialogo
                        textoActivador="Desbanear"
                        titulo="Desbanear gordo"
                        accion={() => RChanClient.removerBan(banVisto.id)}>
                        <span slot="activador" style="display:flex;justify-content:center;"> <Button>Desbanear</Button></span>
                        <div slot="body">Remover ban?</div>
                    </Dialogo>
                {/key}
            {/if}
        </div>
    <div class="lista-usuarios panel">
        <h2>Ultimos 100 usuarios registrados</h2>
        <h4>Hay un total de {cantidadDeUsuarios} usuarios registrados</h4>
        <br>
        <ul>
            {#each ultimosRegistros as u}    
                <li style="padding:4px 8px">Se registro 
                    <a style="color:var(--color6)" href="/Moderacion/HistorialDeUsuario/{u.id}">{u.userName}</a>  
                    hace <Tiempo date={u.creacion} />
                </li>
            {/each}
        </ul>
    </div>
</section>

<style>
    .ban {
        padding:4px 8px;
        background: var(--color4);
        margin-bottom: 4px;
        border-radius: 4px;
    }

    section {
        display: flex;
        gap: 10px;
        justify-content: center;
        align-items: flex-start;
    }

    section>div {
        /* max-width: 500px; */
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