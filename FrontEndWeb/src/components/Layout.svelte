<script>
    import Navbar from './Navbar.svelte'
    import layoutStore from '../layoutStore'

    let cargando = false;
</script>

<Navbar></Navbar>

<svelte:component this={$layoutStore.componentePrimario}></svelte:component>
