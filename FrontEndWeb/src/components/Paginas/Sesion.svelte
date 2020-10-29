<script>
    import {Textfield, Button, Ripple} from "svelte-mui"
    import RChanClient from "../../RChanClient";
    import ErrorValidacion from "../ErrorValidacion.svelte";

    let username = ""
    let password = ""
    let error = null

    export let modo = "login"

    $: modoRegistro = modo == "registro"

    async function accion() {
        try {
            if(modoRegistro)
                await RChanClient.registrase(username, password)
            else
                await RChanClient.logearse(username, password)
        } catch (e) {
            error = e.response.data
            return
        }
        window.location = "/"
        // location.reload();
    }


</script>
<div class="fondo"></div>
<main>
    <video src="623eb91fd792a152481ebe7cecc2ce9f.mp4" loop autoplay muted></video>

    <section >
        <h1>Hola anon</h1>
        {#if !modoRegistro}
            <h2>Para crear y responder hilos en Rozed debes iniciar una sesion</h2>
            <h3>No tenes cuenta? Enfermo!, <a on:click="{()=> modoRegistro=true}" href="#Registro"style="color:var(--color5) ">Registrate ahora mismo aca</a> </h3>
        {:else}
            <h2>Registrate con cofianza</h2>
            <h4>Tu ip esta a salvo, desde ya que si</h4>
        {/if}
        <ErrorValidacion {error}/>
        <form on:submit|preventDefault={accion}>
            <Textfield
            autocomplete="off"
            label="Nombre de usuario"
            required
            bind:value={username}
            message="kikefoster4000"
            />
            <Textfield
                autocomplete="off"
                label="Contraseña"
                type="password"
                required
                bind:value={password}
                message="aynose1234"
            />
            <div style="display:flex; justify-content: center;">
                <Button >{modoRegistro?"Registrarse":"Entrar"}</Button>
            </div>


        </form>
    </section>
</main>

<style>
    main {
        margin:auto;
        height: auto;
        padding: 16px;
        max-width: 1600px;
        margin-top: 80px;
        overflow: hidden;
    }

    section {
        max-width: 600px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: var(--color2);
        padding: 16px ;
        border-radius: 4px;
        border-top: solid 2px var(--color5);
    }
    form {
        color: white !important;
        /* background: var(--color2); */
    }

    video {
        position: fixed;
        z-index: -1;
        top: 50%;
        left: 50%;
        min-width: 100%;
        min-height: calc(100vh - 400px);
        width: auto;
        transform: translateX(-50%) translateY(-50%);
        opacity: 0.4;
        /* filter: contrast(1.5) brightness(1.5); */
    }

    .fondo{
        position: fixed;
        top:0;
        left:0;
        width: 100vw;
        height: 100vh;
        background: var(--color1);
        z-index: -100;
    }

    :global(.label) {
        color: #ffffffcc !important
    }
</style>