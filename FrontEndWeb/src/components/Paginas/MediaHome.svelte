<script>
    import {abrir} from '../Dialogos/Dialogos.svelte'
    import {Button} from 'svelte-mui'
    import BarraModeracion from '../Moderacion/BarraModeracion.svelte';
    import Media from '../Media.svelte'

    let medias = window.model.medias
    let comentarios = window.model.comentarios
</script>

<BarraModeracion/>
<main class="media-home">
    <ul>
        {#each medias as m}
            <li>
                <Media  media={m} modoCuadrado={true}></Media>
                <Button color="var(--color1)" raised on:click={() => abrir.eliminarMedia(m.id)} style="display:none">Eliminar</Button>
            </li>
        {/each}
    </ul>
</main>

<style>
    ul {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
    }
    ul > li {
        width: 128px;
        height: 128px;
        position: relative;

    }

    li :global(button) {
        position: absolute;
        bottom: 0;
    }

    li:hover :global(button){
        display: block !important;
        right: 10px;
    }

    .media-home :global(.media) {
        max-width: inherit;
        width: 100%;
        height: 100%;
    }
</style>