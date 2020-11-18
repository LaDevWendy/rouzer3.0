<script>
    import {Ripple} from 'svelte-mui'
    import config from '../config'
    import FormularioHilo from './Hilos/FormularioHilo.svelte'
    import Notificaciones from './Notificaciones.svelte'
    import MenuPrincipal from './MenuPrincipal.svelte'
    import FormularioLogin from './FormularioLogin.svelte'
    import globalStore from '../globalStore'
    import MensajeRotativo from './MensajeRotativo.svelte'
    import Dialogos from './Dialogos/Dialogos.svelte'
    import {abrir} from './Dialogos/Dialogos.svelte'
    import Denuncia from './Denuncia.svelte';
import DenunciasNav from './Moderacion/DenunciasNav.svelte'

    export let notificaciones = window.notificaciones || []

    let mostrarMenu = false
    let mostrarFormularioHilo = false
    let mostrarCategorias =  false
    let mostrarNotificaciones =  false
</script>
<header>
    <div class="nav-principal">
        <span on:click={() => mostrarMenu = !mostrarMenu}>
            <icon class="fe fe-menu"/>
            <Ripple/>
        </span>
        <a href="/" style="font-family: euroFighter">
            <h3>ROZED <span class="version"> La red del amor (Alfa 0.4)</span></h3>
            
            <Ripple/>
        </a>
        <!-- <MensajeRotativo/> -->

        <div class="nav-botones" style="position: relative;">

            {#if $globalStore.debug}
                <div class="debug notdi-debug">
                    {JSON.stringify(notificaciones)}
                </div>
            {/if}

            <DenunciasNav/>

            {#if $globalStore.usuario.estaAutenticado}
                <Notificaciones bind:notificaciones/>
            {:else}
                <a href="/Login"class="nav-boton"  style="height:100%">
                    <Ripple/>
                    <span class="fe fe-user">
                    </span>
                </a>
            {/if}
            
        </div>
        <span class="nav-boton crear-hilo-boton" on:click={() => mostrarFormularioHilo = true}>
            <span style="width:max-content; margin-right: 6px;cursor: pointer;">Crear Roz</span>
            <span class="fe fe-plus"></span>
            <Ripple/>
        </span>
        <FormularioHilo bind:mostrar ={mostrarFormularioHilo}/>
    <MenuPrincipal bind:mostrar={mostrarMenu}/>
    <FormularioLogin/>
</header>
<nav class="nav-categorias">
    {#each config.categorias as c (c.id)}
        <a href="/{c.nombreCorto}">/{c.nombre} <Ripple/></a>
    {/each}

</nav>

<Dialogos></Dialogos>
<style>
    /*NAVBAR*/

.nav-principal {
    border-top: solid var(--color5) 2px;
    align-items: stretch !important;
    /* margin-bottom: 10px; */
}
.nav-principal>* {
    height: 48px;
    display: flex;
    align-items: center;
    /* margin-bottom: 10px; */
}

.nav-principal, .nav-principal a, :global(.nav-boton) {
    display: flex;
    align-items: center;
}
.nav-principal > {
    flex: 1;
}

:global(.nav-boton), .nav-principal a, .nav-principal icon {
    padding: 0 12px;
}

.nav-botones {
  margin-left: auto;
  align-self: center;
  font-size: 16px;
  display: flex;
}
.crear-hilo-boton{
    background: var(--color5);
}
:global(.nav-boton) {
  color: white;
  margin-left: 16px;
  display: inline-flex;
  position: relative;
}
:global(.nav-boton) .fe:hover {
  transform: scale(1.33);
}

:global(.nav-boton) .fe:active {
  transform: scale(1.22);
}

.nav-categorias {
    display: flex;
    flex-wrap: wrap;
    gap: 5px 10px;
    margin-bottom: 8px;
    font-size: 0.8rem;
    justify-content: center;
}


.nav-categorias a {
    color: var(--color5) !important;
}

.version {
    font-size: 10px;
    position: absolute;
    bottom: 1px;
    right: 5px;
    font-family: sans-serif;
    width: max-content;
}

:global(.noti-cont) {
    position: absolute;
    left: 19px;
    width: 18px;
    top: 10px;
    font-family: helvetica;
}
</style>
