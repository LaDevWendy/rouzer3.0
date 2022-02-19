<script>
    import BarraModeracion from "../Moderacion/BarraModeracion.svelte";

    let usuario = window.model.usuario;
    let huellas = window.model.huellas;
    let hashes = window.model.hashes;

    let cant = 0;
    for (let h of huellas) {
        cant = cant + h.claveContada.cantidad;
    }
</script>

<BarraModeracion />
<main>
    <div>
        <h2>Usuario</h2>
        <p>Nombre: {usuario.nombre}</p>
        <p>Id: {usuario.id}</p>
    </div>
    <div>
        <h2>Huellas</h2>
        <ul>
            {#each huellas as h}
                <li class="grupo">
                    <h3 class="usuario">
                        <span class="nombre">{h.claveContada.clave}</span>
                        <span class="cantidad"
                            >{h.claveContada.cantidad}/{cant}</span
                        >
                    </h3>
                    <ul>
                        {#each h.lista as item}
                            <li class="usuario">
                                <a
                                    class="nombre"
                                    href="/Moderacion/HistorialDeUsuario/{item.clave}"
                                    >{item.nombre}</a
                                >
                                <span class="cantidad"
                                    >{item.cantidad}/{item.total}</span
                                >
                            </li>
                        {/each}
                    </ul>
                </li>
            {/each}
        </ul>
    </div>
    <div>
        <h2>Hashes</h2>
        <ul>
            {#each hashes as h}
                <li class="grupo">
                    <h3 class="usuario">
                        <span class="nombre">{h.claveContada.clave}</span>
                        <span class="cantidad"
                            >{h.claveContada.cantidad}/{cant}</span
                        >
                    </h3>
                    <ul>
                        {#each h.lista as item}
                            <li class="usuario">
                                <a
                                    class="nombre"
                                    style="color:var(--color6)"
                                    href="/Moderacion/HistorialDeUsuario/{item.clave}"
                                    >{item.nombre}</a
                                >
                                <span class="cantidad"
                                    >{item.cantidad}/{item.total}</span
                                >
                            </li>
                        {/each}
                    </ul>
                </li>
            {/each}
        </ul>
    </div>
</main>

<style>
    div {
        margin: 20px;
    }
    .grupo {
        margin: 10px;
    }
    .usuario {
        display: flex;
        max-width: 400px;
    }
    .usuario a {
        color: var(--color6);
    }
    .nombre {
        margin-right: auto;
    }
    .usuario a.nombre {
        margin-left: 5px;
    }
</style>
