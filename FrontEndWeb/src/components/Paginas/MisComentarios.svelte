<script>
    import Comentario from "../Comentarios/Comentario.svelte";

    let comentarios = window.model.comentarios;

    comentarios = comentarios.map((c) => {
        c.respuestas = [];
        return c;
    });
</script>

<main>
    <ul class="comentarios">
        <h3 style="height:40px">Mis últimos comentarios</h3>
        {#each comentarios as c (c.id)}
            <li>
                <a href="/Hilo/{c.hiloId}#{c.id}"
                    ><Comentario comentario={c} />
                </a>
            </li>
        {/each}
    </ul>
</main>

<style>
    main {
        display: flex;
        gap: 10px;
        flex-direction: column;
        margin: auto;
        justify-content: center;
        align-items: center;
    }
    .comentarios {
        background: var(--color4);
        width: 100%;
        max-width: 600px;
        padding: 10px;
    }
</style>
