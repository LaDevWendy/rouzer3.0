<script>
    import { Button } from "svelte-mui";
    import RouzCoins from "./RouzCoins.svelte";
    import globalStore from "../../globalStore";
    export let hilo;
    export let op;
    //export let premium;
    export let donaciones;
    import { abrir } from "../Premium/DialogosPremium.svelte";
</script>

{#if op}
    {#if $globalStore.usuario.esPremium}
        <Button
            on:click={() => abrir.destacar(hilo.id)}
            shaped
            color="goldenrod"><i class="fe fe-zap" /> Destacar</Button
        >
    {/if}
{:else}
    <Button on:click={() => abrir.donar(hilo.id)} shaped color="goldenrod"
        ><i class="fe fe-heart" /> Donar</Button
    >
{/if}

{#if donaciones > 0}
    <Button color="goldenrod" shaped disabled style="text-transform: inherit">
        <RouzCoins cantidad={donaciones} />
    </Button>
{/if}
