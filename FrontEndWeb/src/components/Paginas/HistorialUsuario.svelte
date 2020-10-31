<script>
    import Comentario from '../Comentarios/Comentario.svelte'
    import HiloPreview from '../Hilos/HiloPreview.svelte'

    let hilos = window.model.hilos
    let comentarios = window.model.comentarios
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
 
    <ul style="width:33%">
        <h3 style="height:40px">Ultimos hilos</h3>
        {#each hilos as h}
            <HiloPreview hilo={h}/>
        {/each}
    </ul>
    <ul>
        <h3 style="height:40px">Ultimos comentarios</h3>
        {#each comentarios as c}
            <Comentario comentario={c}/>
        {/each}
    </ul>
</main>

<style >
    main {
        display: flex;
        gap: 10px;
        margin:auto;
        justify-content: center;
    }
    ul {
        max-width: 500px;
        background: var(--color2);
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
 
</style>