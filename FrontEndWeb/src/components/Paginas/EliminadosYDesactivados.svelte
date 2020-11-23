<script>
    import ComentarioMod from '../Moderacion/ComentarioMod.svelte'
    import HiloPreview from '../Hilos/HiloPreview.svelte'
    import {abrir} from '../Dialogos/Dialogos.svelte'
    import {Button} from 'svelte-mui'

    let hilos = window.model.hilos
    let comentarios = window.model.comentarios

    comentarios = comentarios.map (c => {
        c.respuestas = []
        return c
    })
</script>
<nav>
    <a style="color:var(--color5)" href="/Moderacion/ListaDeUsuarios">Usuarios y baneos</a>
    <a style="color:var(--color5)" href="/Moderacion/EliminadosYDesactivados">Eliminados y desactivados</a>
</nav>
<main>
    <ul style="width:33%">
        <h3 style="height:40px">Rozs eliminados</h3>
        {#each hilos as h}
            <HiloPreview hilo={h}/> <Button on:click={() => abrir.restaurarHilo(h.id)}>Restaurar</Button>
        {/each}
    </ul>
    <ul>
        <h3 style="height:40px">Comentarios eliminados</h3>
        {#each comentarios as c}
            <ComentarioMod comentario={c}/>
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