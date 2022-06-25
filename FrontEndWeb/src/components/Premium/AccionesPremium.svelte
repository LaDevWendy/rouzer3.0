<script>
    import config from "../../config";
    import { Button } from "svelte-mui";
    import RouzCoins from "./RouzCoins.svelte";
    export let hilo;
    export let op;
    export let premium;
    export let donaciones;
    import { abrir } from "../Premium/DialogosPremium.svelte";

    let cantidad;
    let ab = config.wares.find((w) => w.id == 0);
</script>

{#if op}
    <Button on:click={() => abrir.destacar(hilo.id)} shaped color="goldenrod"
        ><i class="fe fe-zap" /> Destacar</Button
    >
{:else if premium}
    <Button on:click={() => abrir.donar(hilo.id)} shaped color="goldenrod"
        ><i class="fe fe-heart" /> Donar</Button
    >
{/if}
{#if donaciones > 0}
    <Button color="goldenrod" shaped disabled style="text-transform: inherit">
        <RouzCoins cantidad={donaciones} />
    </Button>
{/if}
