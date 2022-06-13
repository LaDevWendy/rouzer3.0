<script>
    import Media from "../Media.svelte";
    import { fade } from "svelte/transition";
    import { createEventDispatcher } from "svelte";
    import { Button } from "svelte-mui";
    export let comentarios = [];
    export let visible = true;

    let dispatch = createEventDispatcher();

    function onMediaClick(id) {
        visible = false;
        irAComentario(id);
    }

    function irAComentario(id) {
        dispatch("irAComentario", id);
    }

    function cerrar() {
        visible = false;
    }
</script>

{#if visible}
    <div
        transition:fade={{ duration: 150 }}
        class="fondo"
        on:click={cerrar}
        style="z-index:20"
    >
        <section class="carpeta-media panel" on:click|stopPropagation>
            <div class="titulo">
                <h3>Archivos del roz</h3>
                <Button on:click={cerrar} class="cerrar" color="var(--color5)">
                    Cerrar
                </Button>
            </div>
            <ul>
                {#each comentarios as c}
                    {#if c.media}
                        <li r-id={c.id}>
                            <Media
                                media={c.media}
                                spoiler={c.spoiler}
                                modoCuadrado={true}
                            />
                            <a
                                on:click={onMediaClick(c.id)}
                                href="#{c.id}"
                                class="click-area"
                            />
                        </li>
                    {/if}
                {/each}
            </ul>
        </section>
    </div>
{/if}

<style>
    .carpeta-media {
        background: red;
    }
    .titulo {
        display: flex;
        justify-content: space-evenly;
        height: 40px;
        line-height: 40px;
    }
    .fondo {
        position: fixed;
        height: 100vh;
        width: 100vw;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        background: #0000004a;
    }

    ul {
        display: flex;
        /*row-gap: 30px;*/
        column-gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
        max-height: 80vh;
        max-width: 80vw;
        overflow: scroll;
    }
    ul li {
        width: 128px;
        /*height: 128px;*/
        position: relative;
        transition: 0.1s;
    }

    .click-area {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }

    section {
        align-self: center;
        box-shadow: #00000075 0 8px 10px;
        border-top: 2px solid var(--color5);
    }

    h3 {
        text-align: center;
        margin-bottom: 10px;
    }

    /*.carpeta-media :global(.medialink) {
        display: none !important;
    }*/

    /*li:hover {
        transform: translateY(-10px);
    }*/
    @media (max-width: 600px) {
        section {
            width: 100vw;
            max-width: 100vw;
        }
    }
</style>
