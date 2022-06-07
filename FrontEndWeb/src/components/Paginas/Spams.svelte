<script>
    import { Button } from "svelte-mui";
    import RChanClient from "../../RChanClient";
    import ErrorValidacion from "../ErrorValidacion.svelte";

    let spams = window.model.spams;

    let duracion = 0;
    let urlImagen = "";
    let link = "";

    let error;

    async function crearSpam() {
        try {
            let res = await RChanClient.crearSpam(urlImagen, link, duracion);
            location.reload();
        } catch (e) {
            error = e.response.data;
        }
    }
    async function eliminarSpam(id) {
        try {
            let res = await RChanClient.eliminarSpam(id);
            location.reload();
        } catch (e) {
            error = e.response.data;
        }
    }
</script>

<main>
    <section class="panel">
        <h3>RozpPams activos</h3>
        <ul>
            {#each spams as spam (spam.id)}
                <a href={spam.link}>
                    <li
                        class="rozpam"
                        style="background-image: url({spam.urlImagen})"
                    />
                </a>
                <Button on:click={() => eliminarSpam(spam.id)}>Eliminar</Button>
            {/each}
        </ul>
    </section>

    <section class="panel agregar-rozpam">
        <ErrorValidacion {error} />
        <h3>Agregar RozPam</h3>
        <a href="https://imgur.com/upload" target="_blank">Subir imagen</a>
        <input bind:value={urlImagen} placeholder="Link imagen" type="text" />
        <input bind:value={link} placeholder="Link" type="text" />
        <select bind:value={duracion} name="duracion">
            <option value="-1" selected disabled>Duracion</option>
            <option value="5">5 min</option>
            <option value="10">10 min</option>
            <option value="30">30 min</option>
            <option value="60">1 hora</option>
            <option value="360">6 horas</option>
            <option value="1440">1 dia</option>
            <option value="4320">3 dia</option>
            <option value="10080">1 semana</option>
        </select>
        <div style="margin:0 auto; width: fit-content;">
            <Button on:click={crearSpam}>Aceptar</Button>
        </div>
    </section>
</main>

<style>
    main {
        max-width: 1024px;
        display: flex;
        margin: 0 auto;
        gap: 10px;
        flex-wrap: wrap-reverse;
    }
    main section {
        flex: 1;
    }
    .agregar-rozpam {
        max-width: 450px;
    }
    h3 {
        text-align: center;
        margin-bottom: 10px;
    }
    .rozpam {
        border-radius: 4px;
        height: 60px;
        background-size: contain;
    }
</style>
