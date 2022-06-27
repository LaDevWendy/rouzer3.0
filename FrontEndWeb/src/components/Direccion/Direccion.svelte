<script>
    import { Button, Checkbox, Radio } from "svelte-mui";
    import RChanClient from "../../RChanClient";
    import ErrorValidacion from "../ErrorValidacion.svelte";
    import ListaDePedidos from "../Premium/ListaDePedidos.svelte";
    import FormularioCheckearCodigoPremium from "./FormularioCheckearCodigoPremium.svelte";
    import FormularioCrearCodigoPremium from "./FormularioCrearCodigoPremium.svelte";
    import ListaDePremiums from "./ListaDePremiums.svelte";

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
</script>

<div class="row">
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

    <section><FormularioCrearCodigoPremium /></section>

    <section><FormularioCheckearCodigoPremium /></section>

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
</div>
<div class="row">
    <section>
        <h3>Pedidos pendientes</h3>
        <a href="/Direccion/PedidosAceptados">Ver todos los aceptados</a>
        <ListaDePedidos pedidos={model.pedidos} propio={false} />
    </section>
    <section>
        <h3>Últimos premiums</h3>
        <a href="/Direccion/ListaDePremiums">Ver todos los premiums</a>
        <ListaDePremiums premiums={model.premiums} />
    </section>
</div>

<style>
    .row {
        margin-bottom: 10px;
        margin-left: auto;
        margin-right: auto;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        max-width: 1270px;
    }
    .row > section {
        flex: 1;
    }
    section {
        max-width: 400px;
        width: max-content;
        min-width: 270px !important;
    }
    section a {
        color: var(--color5);
    }
    .header {
        background: rgba(255, 255, 255, 0.089) !important;
    }
    .sep {
        margin-left: auto;
    }
</style>
