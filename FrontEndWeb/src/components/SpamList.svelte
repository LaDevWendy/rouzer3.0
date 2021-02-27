<script>
    export let spams = []
</script>

<ul class="rozpams">
    {#each spams as spam (spam.id)}
    <a href={spam.link} rel="nofollow" target="_black">
        <li class="rozpam" style="background-image: url({spam.urlImagen})"></li>
    </a>
    {/each}
</ul>

<style>
    .rozpam {
        border-radius: 4px;
        height: 60px;
        background-size: contain;
    }

    .rozpams {
        display: flex;
        flex-direction: column;
        gap: 10px
    }
</style>