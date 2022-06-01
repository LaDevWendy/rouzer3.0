<script>
    import { ComentarioEstado } from "../../enums";
    import Comentario from "../Comentarios/Comentario.svelte";
    export let comentario;

    function tagCliqueado(e) {
        let newWindow = `/Hilo/${comentario.hiloId}#${comentario.id}`;
        window.open(newWindow, "_blank");
        e.preventDefault();
    }
</script>

<div class:eliminado={comentario.estado == ComentarioEstado.eliminado}>
    <Comentario
        hilo={{ id: comentario.hiloId }}
        {comentario}
        on:tagear={tagCliqueado}
    />
</div>

<style>
    /* .eliminado {
        border-left: solid 2px red;
    } */
</style>
