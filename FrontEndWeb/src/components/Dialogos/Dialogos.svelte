<script context="module">
    import { writable } from "svelte/store";
    import RChanClient from "../../RChanClient";
    import Dialogo from "../Dialogo.svelte";
    import DialogoBan from "./DialogoBan.svelte";
    import DialogoReporte from "./DialogoReporte.svelte";
    import config from "../../config";
    import globalStore from "../../globalStore";
    import ajustesConfigStore from "./ajustesConfigStore";
    import { Textfield, Checkbox } from "svelte-mui";

    const dialogosStore = writable({
        dialogoAbierto: "ninguno",
        hiloId: "",
        comentarioId: "",
        comentariosIds: [],
        usuarioId: "",
        mediaId: "",
        categoriaId: "-1",
        advertenciaCategoria: false,
        eliminarMedia: false,
        eliminarAudio: false,
        mediaEliminarDependientes: true,
        password: "",
    });

    function abrirReporte(hiloId, comentarioId = null) {
        dialogosStore.update((s) => {
            s.dialogoAbierto = "reporte";
            s.hiloId = hiloId;
            s.comentarioId = comentarioId;
            return s;
        });
    }

    function abrirEliminarhilo(hiloId, comentarioId = null) {
        dialogosStore.update((s) => {
            s.dialogoAbierto = "eliminarHilo";
            s.hiloId = hiloId;
            s.comentarioId = comentarioId;
            return s;
        });
    }
    function abrirRestaurarHilo(hiloId, comentarioId = null) {
        dialogosStore.update((s) => {
            s.dialogoAbierto = "restaurarHilo";
            s.hiloId = hiloId;
            return s;
        });
    }
    function abrirRestaurarComentario(hiloId, comentarioId = null) {
        dialogosStore.update((s) => {
            s.dialogoAbierto = "restaurarComentario";
            s.hiloId = hiloId;
            s.comentarioId = comentarioId;
            return s;
        });
    }

    function abrirEliminarComentarios(ids) {
        dialogosStore.update((s) => {
            s.dialogoAbierto = "eliminarComentarios";
            s.comentariosIds = ids;
            return s;
        });
    }
    function abrirBan(hiloId, comentarioId = null, usuarioId = null) {
        dialogosStore.update((s) => {
            s.dialogoAbierto = "ban";
            s.hiloId = hiloId;
            s.comentarioId = comentarioId;
            s.usuarioId = usuarioId;
            return s;
        });
    }
    function abrirEliminarMedia(mediaId) {
        dialogosStore.update((s) => {
            s.dialogoAbierto = "eliminarMedia";
            s.mediaId = mediaId;
            return s;
        });
    }
    function abrirCambiarCategoria(hiloId) {
        dialogosStore.update((s) => {
            s.dialogoAbierto = "cambiarCategoria";
            s.hiloId = hiloId;
            return s;
        });
    }

    export const abrir = {
        //  sticky : abrirDialogo("sticky"),
        ban: abrirBan,
        reporte: abrirReporte,
        eliminarHilo: abrirEliminarhilo,
        eliminarComentarios: abrirEliminarComentarios,
        restaurarHilo: abrirRestaurarHilo,
        restaurarComentario: abrirRestaurarComentario,
        eliminarMedia: abrirEliminarMedia,
        cambiarCategoria: abrirCambiarCategoria,
        //  categoria : abrirDialogo("categoria"),
        //  eliminar : abrirDialogo("eliminar"),
    };
</script>

{#if $dialogosStore.dialogoAbierto == "sticky"}
    <h1>sticky</h1>
{/if}
<DialogoReporte
    visible={$dialogosStore.dialogoAbierto == "reporte"}
    hiloId={$dialogosStore.hiloId}
    comentarioId={$dialogosStore.comentarioId}
/>

<Dialogo
    visible={$dialogosStore.dialogoAbierto == "eliminarHilo"}
    textoActivador="Eliminar"
    titulo="Eliminar roz"
    accion={() => {
        let password = $dialogosStore.password;
        let eliminarMedia = $dialogosStore.eliminarMedia;
        $dialogosStore.eliminarMedia = false;
        $dialogosStore.password = "";
        return RChanClient.borrarHilos(
            [$dialogosStore.hiloId],
            eliminarMedia,
            $dialogosStore.eliminarAudio,
            password
        );
    }}
>
    <span slot="activador" />
    <div slot="body">
        ¿Estas seguro de que queres domar el roz?
        {#if $globalStore.usuario.esMod}
            <Checkbox bind:checked={$dialogosStore.eliminarMedia} right
                >Eliminar Archivos</Checkbox
            >
            {#if $dialogosStore.eliminarMedia}
                <Textfield
                    autocomplete="new-password"
                    label="Contraseña"
                    type="password"
                    required
                    bind:value={$dialogosStore.password}
                    message="contraseña"
                />
            {/if}
            <!--<Checkbox bind:checked={$dialogosStore.eliminarAudio} right
                >Eliminar Audio</Checkbox
            >-->
        {/if}
    </div>
</Dialogo>

<Dialogo
    visible={$dialogosStore.dialogoAbierto == "restaurarHilo"}
    textoActivador="Restaurar"
    titulo="Restaurar el roz"
    accion={() => RChanClient.restaurarRoz($dialogosStore.hiloId)}
>
    <span slot="activador" />
    <div slot="body">¿Estas seguro de que queres restaurar el roz?</div>
</Dialogo>
<Dialogo
    visible={$dialogosStore.dialogoAbierto == "restaurarComentario"}
    textoActivador="Restaurar"
    titulo="Restaurar el comentario"
    accion={() => RChanClient.restaurarComentario($dialogosStore.comentarioId)}
>
    <span slot="activador" />
    <div slot="body">
        ¿Estas seguro de que queres restaurar el comentario {$dialogosStore.comentarioId}?
    </div>
</Dialogo>

<Dialogo
    visible={$dialogosStore.dialogoAbierto == "eliminarComentarios"}
    textoActivador="Eliminar"
    titulo="Eliminar comentario"
    accion={() => {
        let password = $dialogosStore.password;
        let eliminarMedia = $dialogosStore.eliminarMedia;
        $dialogosStore.eliminarMedia = false;
        $dialogosStore.password = "";
        return RChanClient.eliminarComentarios(
            $dialogosStore.comentariosIds,
            eliminarMedia,
            $dialogosStore.eliminarAudio,
            password
        );
    }}
>
    <span slot="activador" />
    <div slot="body">
        ¿Estas seguro de que queres borrar los comentarios {$dialogosStore.comentariosIds}
        {#if $globalStore.usuario.esMod}
            <Checkbox bind:checked={$dialogosStore.eliminarMedia} right
                >Eliminar Archivos</Checkbox
            >
            {#if $dialogosStore.eliminarMedia}
                <Textfield
                    autocomplete="new-password"
                    label="Contraseña"
                    type="password"
                    required
                    bind:value={$dialogosStore.password}
                    message="contraseña"
                />
            {/if}
            <!--<Checkbox bind:checked={$dialogosStore.eliminarAudio} right
                >Eliminar Audio</Checkbox
            >-->
        {/if}
    </div>
</Dialogo>

<DialogoBan
    visible={$dialogosStore.dialogoAbierto == "ban"}
    hiloId={$dialogosStore.hiloId}
    usuarioId={$dialogosStore.usuarioId}
    comentarioId={$dialogosStore.comentarioId}
/>

<Dialogo
    visible={$dialogosStore.dialogoAbierto == "eliminarMedia"}
    textoActivador="Eliminar"
    titulo="Eliminar la imagen/video"
    accion={() => {
        let password = $dialogosStore.password;
        $dialogosStore.eliminarMedia = false;
        $dialogosStore.password = "";
        return RChanClient.eliminarMedias($dialogosStore.mediaId, password);
    }}
>
    <span slot="activador" />
    <div slot="body">
        ¿Estas seguro/a de que querés borrarlo?
        <Textfield
            autocomplete="new-password"
            label="Contraseña"
            type="password"
            required
            bind:value={$dialogosStore.password}
            message="contraseña"
        />
        <!--<Checkbox bind:checked={$dialogosStore.mediaEliminarDependientes} right
            >Eliminar todos los elementos con este archivo?</Checkbox
        >-->
    </div>
</Dialogo>

<Dialogo
    visible={$dialogosStore.dialogoAbierto == "cambiarCategoria"}
    titulo="Cambiar categoria"
    accion={() =>
        RChanClient.cambiarCategoria(
            $dialogosStore.hiloId,
            $dialogosStore.categoriaId,
            $dialogosStore.advertenciaCategoria
        )}
>
    <span slot="activador" />
    <div slot="body">
        <span asp-validation-for="CategoriaId" />
        {#if $ajustesConfigStore.catClasicas}
            <select bind:value={$dialogosStore.categoriaId} name="categoria">
                <option value="-1" selected disabled>Categoría</option>
                {#each config.categorias as c}
                    <option value={c.id}>{c.nombre}</option>
                {/each}
            </select>
        {:else}
            <select bind:value={$dialogosStore.categoriaId} name="categoria">
                <option value="-1" selected disabled>Categoría</option>
                {#each config.grupos as g}
                    <optgroup label={g.nombre} class="grupo-categorias">
                        {#each g.categorias as cid}
                            <option value={cid}
                                >{config.categoriaPorId(cid).nombre}</option
                            >
                        {/each}
                    </optgroup>
                {/each}
            </select>
        {/if}
        <Checkbox bind:checked={$dialogosStore.advertenciaCategoria} right
            >Advertencia</Checkbox
        >
    </div>
</Dialogo>
