<script>
    import ComentarioMod from '../Moderacion/ComentarioMod.svelte';
    import HiloPreviewMod from '../Moderacion/HiloPreviewMod.svelte';

    let hilos = window.model.hilos
    let comentarios = window.model.comentarios
    let usuario = window.model.usuario
    // let denuncias = window.model.denuncias

    const motivo = [ 'CategoriaIncorrecta',
        'Spam',
        'Avatarfageo',
        'Doxxeo',
        'CoentenidoIlegal']

    comentarios = comentarios.map (c => {
        c.respuestas = []
        return c
    })
</script>

<main>
    <div class="panel" style="background:var(--color6) !important;color:black; padding:8px 16px;">
        <h1 style>{usuario.userName}</h1>
    </div>
    <div class="panel">
        <p>Id: {usuario.id}</p>
        <p>Registro: {usuario.creacion}</p>
        <p>Numero de rozs(en db): {usuario.rozs}</p>
        <p>Numero de comentarios(en db): {usuario.comentarios}</p>
    </div>
    
    <div class="historial">
        <ul style="min-width:300px">
            <h3 style="height:40px">Ultimos hilos</h3>
            {#each hilos as h}
                <HiloPreviewMod hilo={h}/>
            {/each}
        </ul>
        <ul>
            <h3 style="height:40px">Ultimos comentarios</h3>
            {#each comentarios as c}
                <ComentarioMod comentario={c}/>
            {/each}
        </ul>
    </div>
</main>

<style >

    h1 {
        text-align: center;
    }
    main {
        display: flex;
        gap: 10px;
        flex-direction: column;
        margin:auto;
        justify-content: center;
        align-items: center;
        max-width: 1400px;
    }
    .historial {
        display: flex;
        gap: 10px;
        margin:auto;
        justify-content: center;
        width: 100%;
    }
    ul, .panel {
        background: var(--color4);
        padding: 10px
    }
    ul :global(.hilo) 
    {
        width: 100%;
        height: 100px !important
    }
    ul :global(.hilo img) 
    {
        height: fit-content;
    }

    .panel {
        width: max-content;
    }
 
</style>