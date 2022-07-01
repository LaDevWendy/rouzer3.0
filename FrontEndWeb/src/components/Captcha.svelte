<script>
    import { onMount } from "svelte";
    import globalStore from "../globalStore";
    import { Button } from "svelte-mui";
    export let token;
    export let visible = true;

    if ($globalStore.usuario.estaAutenticado && $globalStore.usuario.esPremium)
        visible = false;
    onMount(() => {
        if (window.hcaptcha) cargarCaptcha();
        else setTimeout(cargarCaptcha, 500);
    });

    function cargarCaptcha() {
        window.hcaptcha.render("super-captcha", {
            theme: "dark",
            sitekey: window.config.hCaptchaSiteKey,
        });
    }

    function reload() {
        window.hcaptcha.reset();
    }

    window.onCaptcha = (e) => {
        token = e;
    };
</script>

{#if visible}
    <div class="captcha-container">
        <div
            class="h-captcha"
            id="super-captcha"
            style="display:flex"
            data-callback="onCaptcha"
            data-theme="dark"
            data-sitekey={window.config.hCaptchaSiteKey}
        />
        <div class="refresh-container">
            <Button title="Refrescar captcha" icon dense on:click={reload}
                ><icon class="fe fe-refresh-cw" /></Button
            >
        </div>
    </div>
{/if}

<style>
    .h-captcha > :global(*) {
        margin: auto;
    }
    .captcha-container {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
    }
    .refresh-container {
        height: 74px;
        background-color: #333333;
        border-color: white;
        border-style: solid;
        border-width: 2px;
        border-radius: 0 4px 4px 0;
        border-left-width: 0;
        display: flex;
        align-items: center;
    }
</style>
