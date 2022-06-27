<script>
    import RouzCoins from "../Premium/RouzCoins.svelte";

    export let premiums;
</script>

<ul>
    {#each premiums as p}
        <li>
            <div class="info-premium">
                <p>
                    Usuario: <a
                        class="userlink"
                        href="/Moderacion/HistorialDeUsuario/{p.usuario.id}"
                        >{p.usuario.userName}</a
                    >
                </p>
                <p>Balance: <RouzCoins cantidad={p.balance} /></p>
                <p>Expiracion: {new Date(p.expiracion)}</p>
            </div>
        </li>
    {/each}
</ul>

<style>
    .info-premium {
        background-color: var(--color7);
        border-radius: 4px;
        padding-left: 4px;
        padding-right: 4px;
    }
</style>
