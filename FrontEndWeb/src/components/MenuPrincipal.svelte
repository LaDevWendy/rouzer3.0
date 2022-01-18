<script>
    import { Ripple, Sidepanel, Checkbox, Icon } from "svelte-mui";
    import { fly } from "svelte/transition";
    import config from "../config";
    import globalStore from "../globalStore";
    import RChanClient from "../RChanClient";
    import Dialogo from "./Dialogo.svelte";
    import Ajustes from "./Dialogos/Ajustes.svelte";
    import ajustesConfigStore from "./Dialogos/ajustesConfigStore";

    import more from "../icons/more-vertical.svg";
    import serio from "../icons/serio.svg";

    export let mostrar = true;

    $: usuario = $globalStore.usuario;
    let mostrarCategorias = false;
    let mostrarAjustes = false;

    $: if (mostrarAjustes) mostrar = false;

    let categorias = config.categorias.map((c) => {
        c.activa = $globalStore.categoriasActivas.includes(c.id);
        c = c;
        return c;
    });

    let grupos = config.grupos.map((g) => {
        let activo = g.categorias.reduce(
            (acc, cid) => acc || categorias.find((c) => c.id == cid).activa,
            false
        );
        return {
            id: g.id,
            nombre: g.nombre,
            categorias: g.categorias,
            activo: activo,
        };
    });

    let mostrarLista = config.grupos.map((g) => {
        let activo = $globalStore.gruposActivos.includes(g.id);
        return { id: g.id, activo: activo };
    });

    $: $globalStore.gruposActivos = mostrarLista
        .filter((g) => g.activo)
        .map((g) => g.id);

    $: $globalStore.categoriasActivas = categorias
        .filter((c) => c.activa)
        .map((c) => c.id);

    async function desloguearse() {
        await RChanClient.deslogearse();
        location.reload();
    }

    function updateCategorias(cids, value) {
        categorias
            .filter((c) => cids.includes(c.id))
            .map((c) => {
                c.activa = value;
                c = c;
            });
        categorias = categorias;
    }

    function updateGrupo(cid) {
        grupos
            .filter((g) => g.categorias.includes(cid))
            .map((g) => {
                g.activo = g.categorias.reduce(
                    (acc, cid) =>
                        acc || categorias.find((c) => c.id == cid).activa,
                    false
                );
                g = g;
            });
        grupos = grupos;
        mostrarLista
            .filter((g0) =>
                grupos.find((g1) => g1.id == g0.id).categorias.includes(cid)
            )
            .map((g) => (g.activo = grupos.find((g1) => g1.id == g.id).activo));
        mostrarLista = mostrarLista;
    }
</script>

<Sidepanel left bind:visible={mostrar} style="background: red">
    <section class="menu-principal">
        <div class="menu-principal-header">
            <a href="/">
                <h1 style="font-family: 'euroFighter';">
                    {window.config.general.nombre.toUpperCase()}
                </h1>
            </a>
            {#if usuario.estaAutenticado}
                <span style="display: block;text-align: center;"
                    >Hola {usuario.userName}!</span
                >
            {/if}
        </div>
        <ul>
            {#if !usuario.estaAutenticado}
                <a href="/Login">
                    <li>
                        <icon class="fe fe-log-in" /> Iniciar Sesion <Ripple />
                    </li>
                </a>
                <a href="/Inicio">
                    <li><icon class="fe fe-user" /> Crear Sesion <Ripple /></li>
                </a>
            {/if}
            <li
                on:click={() => {
                    mostrarCategorias = !mostrarCategorias;
                }}
            >
                <icon class="fe fe-menu" /> Categorias
                <span style="margin-left:auto" />

                <icon
                    class="fe fe-chevron-down"
                    style="padding:0;transform: rotate({mostrarCategorias
                        ? 180
                        : 0}deg);transition: all 0.2s ease 0s;"
                />

                <Ripple />
            </li>
            {#if mostrarCategorias}
                <div transition:fly={{ y: -50, duration: 150 }}>
                    {#if $ajustesConfigStore.catClasicas}
                        {#each categorias as c (c.id)}
                            <li class="categoria-link">
                                <a href="/{c.nombreCorto}">
                                    <icon class="fe fe-circle" />
                                    {c.nombre}
                                </a>
                                <span
                                    style="width: fit-content;margin-left: auto;"
                                >
                                    <Checkbox
                                        bind:checked={c.activa}
                                        right
                                        on:change={(e) => updateGrupo(c.id)}
                                    /></span
                                >
                                <Ripple />
                            </li>
                        {/each}
                    {:else}
                        {#each grupos as g, i (g.id)}
                            <li
                                class="grupo-categorias {mostrarLista.find(
                                    (g1) => g1.id == g.id
                                ).activo
                                    ? 'grupo-categorias-activo'
                                    : ''}"
                                on:click={() => {
                                    mostrarLista.find(
                                        (g1) => g1.id == g.id
                                    ).activo = !mostrarLista.find(
                                        (g1) => g1.id == g.id
                                    ).activo;
                                    mostrarLista = mostrarLista;
                                }}
                            >
                                <icon
                                    class="fe fe-chevron-down"
                                    style="padding:0;transform: rotate({mostrarLista.find(
                                        (g1) => g1.id == g.id
                                    ).activo
                                        ? 180
                                        : 0}deg);transition: all 0.2s ease 0s;"
                                />
                                <span style="margin-left:auto" />
                                {g.nombre}
                                <Ripple />
                                <span
                                    style="width: fit-content;margin-left: auto;"
                                >
                                    <Checkbox
                                        bind:checked={g.activo}
                                        true
                                        right
                                        on:change={(e) => {
                                            e.preventDefault();
                                            updateCategorias(
                                                g.categorias,
                                                e.target.checked
                                            );
                                            mostrarLista.find(
                                                (g1) => g1.id == g.id
                                            ).activo = e.target.checked;
                                            mostrarLista = mostrarLista;
                                        }}
                                    />
                                </span>
                            </li>
                            {#if mostrarLista.find((g1) => g1.id == g.id).activo}
                                <div transition:fly={{ y: -50, duration: 150 }}>
                                    {#each categorias.filter( (c) => g.categorias.includes(c.id) ) as c (c.id)}
                                        <li class="categoria-link">
                                            <a href="/{c.nombreCorto}">
                                                <icon class="fe fe-circle" />
                                                {c.nombre}
                                            </a>
                                            <span
                                                style="width: fit-content;margin-left: auto;"
                                            >
                                                <Checkbox
                                                    bind:checked={c.activa}
                                                    right
                                                    on:change={(e) =>
                                                        updateGrupo(c.id)}
                                                /></span
                                            >
                                            <Ripple />
                                        </li>
                                    {/each}
                                </div>
                            {/if}
                        {/each}
                    {/if}
                </div>
            {/if}
            <hr />
            <a href="/Archivo">
                <li><icon class="fe fe-book" /> Archivo <Ripple /></li>
            </a>
            <a href="/Archivo/Historicos">
                <li>
                    <icon class="fe fe-anchor" /> Históricos <Ripple />
                </li>
            </a>
            <a href="/Nuevos">
                <li>
                    <icon class="fe fe-trending-up" /> Nuevos <Ripple />
                </li>
            </a>
            <a href="/Serios">
                <li>
                    <Icon
                        color="var(--color-texto2)"
                        style="padding-right: 23px;"
                        ><svelte:component this={serio} /></Icon
                    > Serios <Ripple />
                </li>
            </a>
            <hr />
            {#if $globalStore.usuario.estaAutenticado}
                <a href="/Mis/Creados">
                    <li><icon class="fe fe-target" /> Creados <Ripple /></li>
                </a>
                <a href="/Mis/Favoritos">
                    <li><icon class="fe fe-star" /> Favoritos <Ripple /></li>
                </a>
                <a href="/Mis/Seguidos">
                    <li><icon class="fe fe-eye" /> Seguidos <Ripple /></li>
                </a>
                <a href="/Mis/Ocultos">
                    <li><icon class="fe fe-eye-off" /> Ocultos <Ripple /></li>
                </a>
            {/if}
            <hr />
            <li on:click={() => (mostrarAjustes = true)}>
                <icon class="fe fe-settings" /> Ajustes <Ripple />
            </li>
            <a href="/reglas.html">
                <li><icon class="fe fe-align-justify" /> Reglas <Ripple /></li>
            </a>
            <hr />
            {#if $globalStore.usuario.tieneToken}
                <a href="/Token">
                    <li>
                        <icon class="fe fe-user-check" /> Ver token <Ripple />
                    </li>
                </a>
            {/if}
            {#if $globalStore.usuario.estaAutenticado}
                <li on:click={desloguearse}>
                    <icon class="fe fe-log-out" /> Salir <Ripple />
                </li>
            {/if}
            <hr />

            {#if $globalStore.usuario.esMod}
                <a href="/Moderacion">
                    <li>
                        <icon class="fe fe-triangle" /> Moderacion <Ripple />
                    </li>
                </a>
            {/if}
            {#if $globalStore.usuario.esAdmin}
                <a href="/Administracion">
                    <li>
                        <icon class="fe fe-triangle" /> Administracion <Ripple
                        />
                    </li>
                </a>
            {/if}
            <hr />
        </ul>
    </section>
</Sidepanel>
<Ajustes bind:visible={mostrarAjustes} />

<style>
    :global(.side-panel) {
        width: auto !important;
        min-width: 256px;
    }
    .categoria-link a {
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
    }
    .menu-principal :global(.icon) {
        opacity: 0.7;
        padding-right: 17px;
    }
</style>
