<script>
    import Dialogo from "../Dialogo.svelte";
    import globalStore from "../../globalStore";
    import RChanClient from "../../RChanClient";
    import { MotivoDenuncia } from "../../enums";
    import config from "../../config";
    import ajustesConfigStore from "./ajustesConfigStore";

    export let comentarioId = "";
    export let hiloId = "";
    $: tipo = comentarioId == "" || !comentarioId ? 0 : 1;
    $: tipoString = tipo == 0 ? "hilo" : "comentario";

    let motivo = -1;
    let aclaracion = "";
    let categoria = -1;

    export let visible = false;

    $: if (visible == false) {
        motivo = -1;
        aclaracion = "";
        categoria = -1;
    }

    function ExceptionReporte(mensaje) {
        this.response = { data: { Motivo: mensaje } };
    }
</script>

<Dialogo
    bind:visible
    textoActivador="Reportar {tipoString}"
    titulo="Reportar {tipoString}"
    accion={() => {
        let motivoReporte = motivo;
        let aclaracionReporte = aclaracion;
        if (motivoReporte === 0) {
            /*if (categoria === -1) {
                let e = new ExceptionReporte("Especifique categoría");
                throw e;
            }*/
            if (categoria != -1) {
                if (aclaracionReporte != "") {
                    aclaracionReporte += "\n";
                }
                aclaracionReporte += `[${
                    config.categoriaPorId(categoria).nombre
                }]`;
            }
        }
        /*if (aclaracionReporte === "" && motivoReporte != -1) {
            let e = new ExceptionReporte(
                "Ingrese una breve descripción de su denuncia"
            );
            throw e;
        }*/
        return RChanClient.Denunciar(
            tipo,
            hiloId,
            motivoReporte,
            aclaracionReporte,
            comentarioId
        );
    }}
>
    <slot slot="activador" />
    <div slot="body">
        <p>
            Reportar el {tipoString}
            {tipoString == "hilo" ? hiloId : comentarioId}
        </p>
        <select bind:value={motivo} name="motivo">
            <option value="-1" selected disabled>Motivo</option>
            <!-- {#if tipoString == "hilo"}
                <option value="0">1) Categoria incorrecta</option>
            {/if} -->
            {#each Object.keys(MotivoDenuncia) as k, i}
                <option value={MotivoDenuncia[k]}>{k}</option>
            {/each}
        </select>
        {#if motivo === 0}
            {#if $ajustesConfigStore.catClasicas}
                <select bind:value={categoria} name="categoria">
                    <option value="-1" selected disabled>Categoría</option>
                    {#each config.categorias as c}
                        <option value={c.id}>{c.nombre}</option>
                    {/each}
                </select>
            {:else}
                <select bind:value={categoria} name="categoria">
                    <option value="-1" selected disabled>Categoría</option>
                    {#each config.grupos as g}
                        <optgroup
                            id="grupo_{g.id}"
                            label={g.nombre}
                            class="grupo-categorias"
                        >
                            {#each g.categorias as cid}
                                <option value={cid}
                                    >{config.categoriaPorId(cid).nombre}</option
                                >
                            {/each}
                        </optgroup>
                    {/each}
                </select>
            {/if}
        {/if}

        <textarea placeholder="Aclaracion" bind:value={aclaracion} />
    </div>
</Dialogo>
