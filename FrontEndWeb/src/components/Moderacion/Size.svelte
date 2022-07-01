<script>
    export let size;
</script>

<div class="hilo-size" title={`${size} B`}>
    {#if size > 1073741824}
        {(size / 1073741824).toFixed(2)}GB
    {:else if size > 1048576}
        {(size / 1048576).toFixed(2)}MB
    {:else if size > 1024}
        {(size / 1024).toFixed(2)}KB
    {:else}
        {size} B
    {/if}
</div>

<style>
    .hilo-size {
        background-color: var(--color8);
        border-radius: 4px;
    }
</style>
