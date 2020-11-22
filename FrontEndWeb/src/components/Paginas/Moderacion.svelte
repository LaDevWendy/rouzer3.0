<script>
    import { each } from 'svelte/internal'
    import Comentario from '../Comentarios/Comentario.svelte'
    import Denuncia from '../Denuncia.svelte'
    import HiloPreview from '../Hilos/HiloPreview.svelte'

    let hilos = window.model.hilos
    let comentarios = window.model.comentarios
    let denuncias = window.model.denuncias
    let comentariosMedia = window.model.medias

    comentarios = comentarios.map (c => {
        c.respuestas = []
        return c
    })
</script>
<main>
    <nav>
        <a style="color:var(--color5)" href="/Moderacion/ListaDeUsuarios">Usuarios y baneos</a>
        <a style="color:var(--color5)" href="/Moderacion/EliminadosYDesactivados">Eliminados y desactivados</a>
    </nav>
    <div class="ultimos-medias">
        <ul>
            {#each comentariosMedia as c}
                <li>
                    <a href="/Hilo/{c.hiloId}#{c.id}">
                        <img src="{c.media.vistaPreviaCuadrado}" alt="">
                    </a>
                </li>
            {/each}
        </ul>
    </div>
    <div class="seccion2">
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
                <div style="display:flex;">
                    <a start="color: var(--color5) !important" href="/Hilo/{c.hiloId}#{c.id}">Ir</a>
                    <Comentario comentario={c}/>
                </div>
            {/each}
        </ul>
    </div>
</main>

<style >
    main {
        display: flex;
        gap: 10px;
        margin: auto;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .seccion2 {
        display: flex;
        gap: 10px;
        margin:auto;
        justify-content: center;
    }
    .seccion2 ul {
        max-width: 500px;
        background: var(--color2);
        padding: 10px
    }
    .seccion2 ul :global(.hilo) 
    {
        width: 100%;
        height: 100px !important
    }
   .seccion2  ul :global(.hilo img) 
    {
        height: fit-content;
    }

    .ultimos-medias ul {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }
    .ultimos-medias img {
        width: 64px;
        height: 64px;
        border-radius: 4px;
    }

</style>