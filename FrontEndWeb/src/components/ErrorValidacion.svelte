<script>
    export let error = null

</script>

{#if error && error.errors}
<div class="error-validacion">
    <h3>Ay no se!</h3>
    {#each Object.keys(error.errors) as key}
            <div class="">
                <strong>{key}:</strong>
                {#each error.errors[key] as e}
                    {e} 
                {/each}
            </div>
        {/each}
    </div>
{:else if error}
<div class="error-validacion">
    <h3>Ay no se!</h3>
    {#each Object.keys(error) as key}
            <div class="">
                <strong>{key}:</strong>
                {#each error[key] as e}
                    {e} 
                {/each}
            </div>
        {/each}
    </div>
{/if}
