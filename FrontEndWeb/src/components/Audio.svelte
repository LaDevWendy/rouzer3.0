<script>
    export let urlBlobAudio;
</script>

<audio controls="controls" preload="metadata">
    <source src="/Audios/{urlBlobAudio}" type="audio/webm" />
</audio>

<style>
    audio {
        height: 32px;
        border-radius: 16px;
    }
</style>
