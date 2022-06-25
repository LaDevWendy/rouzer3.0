<script>
    import MensajeGlobal from "./MensajeGlobal.svelte";
    export let mensajesGlobales = [];
    import Signal from "../../signal";

    Signal.coneccion.on("MensajeGlobalEliminados", (id) => {
        mensajesGlobales = mensajesGlobales.filter((mg) => !(mg.id == id));
    });
</script>

<ul>
    {#each mensajesGlobales as mg}
        <li><MensajeGlobal {mg} /></li>
    {/each}
</ul>
