<script>
import { onMount } from "svelte";

    let style = window.document.styleSheets[0];
    let rule = style.cssRules.length
    // style.insertRule("body {filter: brightness(0.7) contrast(2.5) saturate(4.5);animation: temblequeo 0.1s infinite;}", style.cssRules.length)
    // style.removeRule()

    function wait(milisegundos = 1000) {
        return new Promise((resolve) => {
            setTimeout(resolve, milisegundos)
        })
    }

    onMount(async () => {
        return
        while (true) {
            await wait(Math.random() * 10 * 1000)
            style.insertRule("body {filter: brightness(0.7) contrast(2.5) saturate(4.5);animation: temblequeo 0.1s infinite;}", rule)
            rule++
            await wait(Math.random() * 10 * 1000)
            style.insertRule("body {filter: none;animation: none;}", rule)
            rule++
        }
    })
</script>

<style>
    @keyframes  -global-temblequeo{
        0% {
            transform: translateY(0px);
            background: red !important;
        }
        50% {
            transform: translateY(50px) rotateY(23deg)
        }
        100% {
            transform: translateY(0px)
        }
    }
</style>