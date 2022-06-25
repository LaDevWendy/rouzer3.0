<script>
    import { Button, Checkbox, Radio } from "svelte-mui";
    import RChanClient from "../../RChanClient";
    import ErrorValidacion from "../ErrorValidacion.svelte";
    import Spinner from "../Spinner.svelte";
    import { TipoAccionCP, TipoCP } from "../../enums";

    let model = window.model;
    let error1 = null;
    let nickDev = "";
    let nickDirector = "";

    async function eliminar(nick, rol) {
        error1 = null;
        try {
            let res = await RChanClient.removerRol(nick, rol);
            console.log(res);
            alert(res.data.mensaje);
        } catch (e) {
            console.log(e.response);
            error1 = e.response.data;
            return;
        }
    }

    async function añadir(nick, rol) {
        error1 = null;
        try {
            let res = await RChanClient.añadirRol(nick, rol);
            console.log(res);
            alert(res.data.mensaje);
        } catch (e) {
            console.log(e.response);
            error1 = e.response.data;
            return;
        }
    }

    let tipocp;
    let cantidad = 1;
    let usos = 1;
    let expiracion;
    let cargando = false;
    let codigoPremium;

    let error2 = null;
    async function crear() {
        cargando = true;
        error2 = null;
        try {
            const res = await RChanClient.crearCodigoPremium(
                tipocp,
                cantidad,
                usos,
                expiracion
            );
            codigoPremium = res.data.cp;
            cargando = false;
            tipocp = -1;
            cantidad = 1;
            usos = 1;
            expiracion = null;
        } catch (e) {
            cargando = false;
            error2 = e.response.data;
        }
    }

    let ccp;
    let error3 = null;
    let cargando2 = false;
    let codigoPremiumCheckeado;
    let historialcp;
    async function checkear() {
        cargando2 = true;
        error3 = null;
        try {
            const res = await RChanClient.checkearCodigoPremium(ccp);
            cargando2 = false;
            codigoPremiumCheckeado = res.data.cp;
            historialcp = res.data.historial;
        } catch (e) {
            cargando2 = false;
            error3 = e.response.data;
        }
    }
</script>

<main class="administracion">
    <section>
        <h3>Equipo</h3>
        <ErrorValidacion error={error1} />
        <div class="menu">
            <ul>
                <li class="header">Directores</li>
                <li class="noback">
                    <input
                        bind:value={nickDirector}
                        type="text"
                        placeholder="Id o nick del usuario"
                    />
                    <Button on:click={() => añadir(nickDirector, "director")}
                        >Añadir</Button
                    >
                </li>
                {#each model.directores as a (a.id)}
                    <li>
                        {a.userName} <span class="sep" /><Button
                            on:click={() => eliminar(a.id, "director")}
                            >Eliminar</Button
                        >
                    </li>
                {/each}
                <hr />
                <li class="header">Developers</li>
                <li class="noback">
                    <input
                        bind:value={nickDev}
                        type="text"
                        placeholder="Id o nick del usuario"
                    />
                    <Button on:click={() => añadir(nickDev, "dev")}
                        >Añadir</Button
                    >
                </li>
                {#each model.devs as d (d.id)}
                    <li>
                        {d.userName} <span class="sep" /><Button
                            on:click={() => eliminar(d.id, "dev")}
                            >Eliminar</Button
                        >
                    </li>
                {/each}
            </ul>
        </div>
    </section>

    <section>
        <h3>Creacion Código Premium</h3>
        <ErrorValidacion error={error2} />
        <form class="formulario panel" on:submit|preventDefault>
            <label for="tipocp"> Tipo: </label>
            <select id="tipocp" bind:value={tipocp}>
                <option value="-1" selected disabled>Tipo</option>
                {#each Object.keys(TipoCP) as tcp}
                    <option value={TipoCP[tcp]}>{tcp}</option>
                {/each}
            </select>
            <label for="cantidad"> Cantidad: </label>
            <input
                id="cantidad"
                type="number"
                min="1"
                step="1"
                bind:value={cantidad}
            />
            <label for="usos"> Usos: </label>
            <input id="usos" type="number" min="1" step="1" bind:value={usos} />
            <label for="expiracion"> Expiración: </label>
            <input type="date" id="expiracion" bind:value={expiracion} />
            <Button color="primary" disabled={cargando} on:click={crear}>
                <Spinner {cargando}>Crear</Spinner>
            </Button>
            {#if codigoPremium}
                <p class="exito">{codigoPremium}</p>
            {/if}
        </form>
    </section>

    <section>
        <h3>Checkear Código Premium</h3>
        <ErrorValidacion error={error3} />
        <form class="formulario panel" on:submit|preventDefault>
            <input type="text" placeholder="XXXXXXXX" bind:value={ccp} />
            <Button color="primary" disabled={cargando} on:click={checkear}>
                <Spinner {cargando2}>Checkear</Spinner>
            </Button>
            {#if codigoPremiumCheckeado}
                <div class="codigo-info">
                    <p>
                        Tipo: {TipoCP.aString(codigoPremiumCheckeado.tipo)}
                    </p>
                    <p>Cantidad: {codigoPremiumCheckeado.cantidad}</p>
                    <p>Usos: {codigoPremiumCheckeado.usos}</p>
                    <p>
                        Expiración: {new Date(
                            codigoPremiumCheckeado.expiracion
                        )}
                    </p>
                </div>
            {/if}
            {#if historialcp}
                <ul>
                    <h4>Historial del código</h4>
                    {#each historialcp as acp}
                        <li class="accion">
                            <p>Fecha: {new Date(acp.creacion)}</p>
                            <p>
                                Usuario: <a
                                    class="userlink"
                                    href="/Moderacion/HistorialDeUsuario/{acp
                                        .usuario.id}">{acp.usuario.userName}</a
                                >
                            </p>
                            <p>Tipo: {TipoAccionCP.aString(acp.tipo)}</p>
                        </li>
                    {/each}
                </ul>
            {/if}
        </form>
    </section>

    <section>
        <h3>Otros</h3>
        <div class="menu">
            <ul>
                <a href="/Direccion/Spams">
                    <li>RozPams</li>
                </a>
            </ul>
        </div>
    </section>
</main>

<style>
    main {
        margin: auto;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        max-width: 1270px;
        margin: auto;
    }
    main > section {
        flex: 1;
    }
    section {
        max-width: 400px;
        width: max-content;
        min-width: 270px !important;
    }
    .header {
        background: rgba(255, 255, 255, 0.089) !important;
    }
    .sep {
        margin-left: auto;
    }

    textarea {
        padding: 0 16px;
        background: var(--color1);
    }
    .tiempo {
        margin-left: auto;
        opacity: 0.5;
        font-size: 12px;
    }

    .codigo-info {
        background-color: var(--color3);
    }
    .accion {
        background-color: var(--color7);
    }
    .accion,
    .codigo-info {
        border-radius: 4px;
        padding-left: 4px;
        padding-right: 4px;
    }
</style>
