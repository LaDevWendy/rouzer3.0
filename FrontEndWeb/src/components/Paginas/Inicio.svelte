<script>
    import { Button, Checkbox } from "svelte-mui";
    import RChanClient from "../../RChanClient";
    import Captcha from "../Captcha.svelte";
    import ErrorValidacion from "../ErrorValidacion.svelte";
    import config from "../../config";
    import { fpPromise } from "../../fingerprint";

    let terminos = false;
    let captcha = "";
    let error = null;
    let codigo = "";

    if (window.model && window.model.codigoDeInvitacion) {
        codigo = window.model.codigoDeInvitacion;
    }

    async function accion(e) {
        console.log(captcha);
        try {
            let result = await (await fpPromise).get();
            await RChanClient.inicio(captcha, result.visitorId, codigo);
        } catch (e) {
            console.log(e);
            error = e.response.data;
            return;
        }
        // window.location = "/"
        // location.reload();
    }
</script>

<div class="fondo" />
<main>
    <!-- <video src="623eb91fd792a152481ebe7cecc2ce9f.mp4" loop autoplay muted></video> -->

    <section>
        {#if config.general.registroAbierto || codigo}
            <h2>Para usar {config.nombre} debes leer y aceptar las reglas</h2>
            <h4>Tu ip esta a salvo, desde ya que si</h4>
            <h4>
                Preferis crear una sesion con usuario y contraseña? <a
                    style="color:var(--color5); text-align:center;"
                    href="/Registro">Registro</a
                >
            </h4>
            <ErrorValidacion {error} />
            <form on:submit|preventDefault={accion}>
                <a
                    style="color:var(--color5); text-align:center; display:block;font-weight: bold;font-size: 19px;"
                    target="_blank"
                    href="/reglas.html">Ver reglas</a
                >
                <Checkbox right bind:checked={terminos}
                    ><div style="white-space: normal; text-align: center;">
                        Yo Anon juro solemnemente seguir las reglas de {config.nombre}
                    </div></Checkbox
                >
                <Captcha
                    visible={config.general.captchaRegistro}
                    bind:token={captcha}
                />

                <div
                    style="display:flex; justify-content: center; margin-top: 8px"
                >
                    <Button disabled={!terminos}>Empezar a rozear</Button>
                </div>
            </form>
        {:else}
            <h2>
                Lo siento anon, el inicio de sesiones esta temporalmente
                deshabilitado
            </h2>
        {/if}
    </section>
</main>

<style>
    main {
        margin: auto;
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
        padding: 16px;
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

    .fondo {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -100;
        background: url("/imagenes/rosed.png");
        background-size: cover !important;
    }
    :global(.label) {
        color: #ffffffcc !important;
    }
</style>
