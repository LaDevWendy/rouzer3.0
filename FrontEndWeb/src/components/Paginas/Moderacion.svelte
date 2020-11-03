<script>
    import Comentario from '../Comentarios/Comentario.svelte'
import Denuncia from '../Denuncia.svelte'
    import HiloPreview from '../Hilos/HiloPreview.svelte'

    let hilos = window.model.hilos
    let comentarios = window.model.comentarios
    let denuncias = window.model.denuncias

    comentarios = comentarios.map (c => {
        c.respuestas = []
        return c
    })
</script>

<main>
    <ul style="width:33%; background:#711c08;        font-size: 0.7em;    ">
        <h3 style="height:40px">Ultimas denuncias</h3>
        {#each denuncias as d}
            <Denuncia denuncia={d}/>
        {/each}
    </ul>
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

    .hilo-denuncia {
        padding: 10px;
        font-size: 1em;
        background: var(--color2);
        min-height: 110px;

    }
    .hilo-denuncia img{
        width: 100px;
        float: left;
        padding-right: 10px;
    }
    .hilo-denuncia img::after{
        content: "";
    }
</style>