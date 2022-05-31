<script>
    import HiloPreview from "../Hilos/HiloPreview.svelte";
    import { HiloEstado } from "../../enums";
    export let hilo;
</script>

<div
    class="hilo-preview-mod"
    class:eliminado={hilo.estado == HiloEstado.eliminado}
>
    <HiloPreview {hilo} />
</div>

<style>
    .hilo-preview-mod {
        background: var(--color1);
    }
    .hilo-preview-mod :global(.hilo) {
        width: 100%;
        height: 100px !important;
    }
    .hilo-preview-mod :global(.hilo img) {
        height: fit-content;
    }
    .hilo-preview-mod :global(.hilo a) {
        background-repeat: no-repeat !important;
        background-position-x: right !important;
    }
    .hilo-preview-mod :global(.hilo a.es-gif) {
        background-size: contain !important;
    }
    .hilo-preview-mod :global(.spoiler) {
        box-shadow: initial;
        overflow: initial;
    }
    .hilo-preview-mod :global(.spoiler::before) {
        content: none;
    }
    .eliminado {
        border-left: solid 2px red;
    }
</style>
