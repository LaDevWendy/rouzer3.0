<script>
    import {ButtonGroup , Button} from 'svelte-mui'
</script>

<nav class="moderacion-nav" style="width:100%;margin:0 auto;">
    <ButtonGroup  color="var(--color7)" >
        <Button outlined> <a href="/Moderacion">Pagina principal</a></Button>
        <Button outlined> <a href="/Moderacion/ListaDeUsuarios">Usuarios y baneos</a></Button>
        <Button outlined> <a href="/Moderacion/EliminadosYDesactivados">Eliminados y desactivados</a></Button>
        <Button outlined> <a href="/Moderacion/Media">Imagenes y videos</a></Button>
    
    </ButtonGroup >
</nav>
<style>
    .moderacion-nav {
        width: 100%;
        justify-content: center;
        display: flex;
        margin-bottom: 8px !important;
    }
</style>
