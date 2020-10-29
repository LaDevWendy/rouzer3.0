<script>
    import { Ripple, Sidepanel, Checkbox } from 'svelte-mui';
    import {fly} from 'svelte/transition'
    import config from '../config';
    import globalStore from '../globalStore'
    import RChanClient from '../RChanClient';
    $:usuario = $globalStore.usuario

    export let mostrar = true

    let mostrarCategorias = false

    let categorias =  config.categorias.map(c => {
        c.activa = $globalStore.categoriasActivas.includes(c.id)
        c = c
        return c
    })
    $: $globalStore.categoriasActivas = categorias.filter(c => c.activa).map(c => c.id)

    async function desloguearse() {
        await RChanClient.deslogearse()
        location.reload()
    }
</script>

<Sidepanel left bind:visible={mostrar} disableScroll style="background: red">
    <section class="menu-principal">
        <div class="menu-principal-header">
            <h1 style="font-family: 'euroFighter';">ROSED</h1>
            {#if usuario.estaAutenticado}
            <span style="display: block;text-align: center;">Hola {usuario.userName}!</span>
            {/if}
        </div>
        <ul>
            {#if !usuario.estaAutenticado}
            <a href="/Login">
                <li> <icon class="fe fe-log-in"/> Iniciar Sesion  <Ripple/></li>
            </a>
            <a href="/Registro">
                <li> <icon class="fe fe-user"/> Registrarse  <Ripple/></li>
            </a>
            {:else}
                <li on:click={desloguearse}> <icon class="fe fe-log-out"/> Salir  <Ripple/></li>
            {/if}
            <li on:click={() => mostrarCategorias = !mostrarCategorias}>
                <icon class="fe fe-menu"/> Categorias 
                <span style="margin-left:auto"></span>

                    <icon class="fe fe-chevron-down" style="padding:0;transform: rotate({mostrarCategorias?180:0}deg);transition: all 0.2s ease 0s;"/>  

                <Ripple/></li>
            {#if mostrarCategorias}
                <div transition:fly={{y: -50, duration:150}}>
                    {#each categorias as c (c.id)}
                    
                    <li > <icon class="fe fe-circle"/>  {c.nombre}
                        <span style="width: fit-content;margin-left: auto;">
                            <Checkbox bind:checked={c.activa} right></Checkbox></span> 
                        <Ripple/></li>
                    {/each}

                </div>
            {/if}
            <hr>
            <a href="/Mis/Creados">
                <li> <icon class="fe fe-target"/> Creados  <Ripple/></li>
            </a>
            <a href="/Mis/Favoritos">
                <li> <icon class="fe fe-star"/> Favoritos  <Ripple/></li>
            </a>
            <a href="/Mis/Seguidos">
                <li> <icon class="fe fe-eye"/> Seguidos  <Ripple/></li>
            </a>
            <a href="/Mis/Ocultos">
                <li> <icon class="fe fe-eye-off"/> Ocultos  <Ripple/></li>
            </a>
            <hr>
            {#if $globalStore.usuario.esMod}
                <a href="/Moderacion">
                    <li> <icon class="fe fe-triangle"/> Moderacion  <Ripple/></li>
                </a>
            {/if}
            {#if $globalStore.usuario.esAdmin}
                <a href="/Administracion">
                    <li> <icon class="fe fe-triangle"/> Administracion  <Ripple/></li>
                </a>
            {/if}
            <hr>
            <li> <icon class="fe fe-settings"/> Ajustes  <Ripple/></li>
        </ul>
    </section>
</Sidepanel>