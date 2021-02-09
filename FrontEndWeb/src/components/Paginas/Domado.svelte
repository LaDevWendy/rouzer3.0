<script>
    import {Button} from 'svelte-mui'
    import config from '../../config';
    import {formatearTiempo, formatearTimeSpan} from '../../helper'
    const ban = window.model.ban
    const esAdvertencia = ban.duracion.includes("00:00:00") && (ban.duracion.length == 16 || ban.duracion.length == 8)

</script>
<div class="fondo">
    <div class="ban" class:advertencia={esAdvertencia}>
        <h1>Has sido {esAdvertencia?'advertido':'baneado'}!</h1>
        <h2 style="margin-bottom:10px">Fuiste {esAdvertencia?'advertido':'baneado'} por romper las reglas de {config.nombre} {ban.tipo== 0? `en el roz "${ban.hilo}"`:`en un comentario en el roz "${ban.hilo}"`}</h2>
        <h3>Aclaracion: <strong>{ban.aclaracion ||" "}</strong> </h3>
        <p>Motivo: {ban.motivo}</p>
        <p>Fecha: {formatearTiempo(ban.creacion)}</p>

        {#if !esAdvertencia}
            <p>Duracion: {formatearTimeSpan(ban.duracion)}</p>
            <p>Expira el: {formatearTiempo(ban.expiracion)}</p>
            <p>Id del ban: {ban.id}</p>
        {/if}
        
        <a href="/">
            <Button>Aceptar</Button>
        </a>
        <a href="/reglas.html">
            <Button>Ver reglas</Button>
        </a>
    </div>
</div>

<style>
    .ban {
        background: var(--color5);
        text-align: center;
        border-radius: 8px;
        position: absolute;
        font-size: 0.8rem;
        right: calc(7vw - 100px);
        top: calc(22vw - 50px);
        max-width: 400px;
        padding: 2px;
    }
    .advertencia {
        background: var(--color6)
    }
    .fondo {
        background-size: 100vw !important;
        min-height: 100vh;
        top: 0;
        right: 0;
        position: fixed;
        width: 100%;
        background: url(/imagenes/roseban.png);
        background-repeat:  no-repeat;
    }

    @media(max-width: 1000px) 
    {
        .fondo {
            background-size:  1000px !important;
            background-position: right;
            background-position-y: bottom;
            /* top: 400px; */
        }
        .ban {
            top: 300px;
            right : 0px;
        }
    }
</style>