<script>
    import MediaType from "../MediaType";
    import { Button, ButtonGroup, Icon } from "svelte-mui";
    import { onDestroy, onMount } from "svelte";

    export let compacto = false;
    export let media = {
        archivo: null,
        link: "",
    };
    export let videoUrl = null;

    let vistaPreviaYoutube = "";

    let menuLink = false;
    let archivoBlob = null;
    let input = null;
    let mediaType = MediaType.Imagen;
    let el;

    let inputLink = "";
    let estado = "vacio"; // importarLink | cargado
    const youtubeRegex =
        /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,12})/;
    const bitchuteRegex =
        /(?:bitchute\.com\/\S*(?:(?:\/e(?:mbed))?\/|video\?(?:\S*?&?v\=)))([a-zA-Z0-9_-]{6,12})/;
    const dailyMotionRegex =
        /(?:(?:dailymotion\.com\/(?:embed\/)?video\/)|(?:dai\.ly\/))([a-zA-Z0-9_-]{6,12})/;
    const pornhubRegex =
        /(?:pornhub.com\/(?:(?:view_video\.php\?viewkey=)|(?:embed\/)))([a-zA-Z0-9_-]{10,20})/;

    async function actualizarArchivo() {
        if (input.files && input.files[0]) {
            archivoBlob = await getBlobFromInput(input);
            media.archivo = input.files[0];

            if (input.files[0].type.indexOf("image") != -1) {
                mediaType = MediaType.Imagen;
            } else if (input.files[0].type.indexOf("video") != -1) {
                mediaType = MediaType.Video;
            }
        }
    }

    async function getBlobFromInput(input) {
        return new Promise((resolve, reject) => {
            if (!(input.files && input.files[0])) return null;
            let blob;
            let reader = new FileReader();
            reader.onload = function (e) {
                blob = e.target.result;
                resolve(blob);
            };
            reader.readAsDataURL(input.files[0]);
        });
    }

    async function importarVideo() {
        let id = inputLink.match(youtubeRegex);
        if (id) {
            mediaType = MediaType.Youtube;
            vistaPreviaYoutube = `https://img.youtube.com/vi/${id[1]}/hqdefault.jpg`;
            videoUrl = inputLink;
            archivoBlob = `https://img.youtube.com/vi/${id[1]}/hqdefault.jpg`;
            media.link = videoUrl;
            estado = "cargado";
            return;
        }
        id = inputLink.match(bitchuteRegex);
        if (id) {
            mediaType = MediaType.Bitchute;
            videoUrl = inputLink;
            archivoBlob = `https://www.bitchute.com/static/v133/images/logo-full-day.png`;
            media.link = videoUrl;
            estado = "cargado";
            return;
        }
        id = inputLink.match(dailyMotionRegex);
        if (id) {
            mediaType = MediaType.DailyMotion;
            videoUrl = inputLink;
            archivoBlob = `https://www.dailymotion.com/thumbnail/video/${id[1]}`;
            media.link = videoUrl;
            estado = "cargado";
            return;
        }
        id = inputLink.match(pornhubRegex);
        if (id) {
            mediaType = MediaType.PornHub;
            videoUrl = inputLink;
            archivoBlob = `https://ei.phncdn.com/www-static/images/pornhub_logo_straight.png`;
            media.link = videoUrl;
            estado = "cargado";
            return;
        }
        importarArchivo();
        return;
    }
    async function importarArchivo() {
        let match = inputLink.match(
            /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi
        );
        if (!match || match.length == 0) {
            inputLink = "Link invalido";
            return;
        }
        // Chekear si el link es valido
        if (inputLink.includes(".webm") || inputLink.includes("mp4"))
            mediaType = MediaType.Video;
        else mediaType = MediaType.Imagen;

        archivoBlob = inputLink;
        media.link = inputLink;
        media.archivo = inputLink;
        estado = "cargado";
    }

    export function removerArchivo() {
        media.archivo = null;
        media.link = "";
        archivoBlob = null;
        input.value = "";
        inputLink = "";
        mediaType = MediaType.Imagen;
        estado = "vacio";
        inputLink = "";
    }

    onDestroy(() => {
        media.archivo = null;
        archivoBlob = null;
    });

    onMount(() => {
        window.addEventListener("paste", (e) => {
            if (e.clipboardData.files) input.files = e.clipboardData.files;
            actualizarArchivo();
        });
    });

    export let spoiler = false;
</script>

<input
    name="archivo"
    on:change={actualizarArchivo}
    type="file"
    id="hilo-input"
    style="position: absolute; top:-1000px"
    bind:this={input}
/>
<div
    bind:this={el}
    class:compacto
    class="video-preview media-input"
    style="{(media.archivo || media.link) && mediaType != MediaType.Video
        ? `background-image:url(${archivoBlob || media})!important`
        : 'background-image:url(/imagenes/rose2.jpg)'};overflow:hidden;"
>
    {#if mediaType == MediaType.Video && media.archivo}
        <video src={archivoBlob} />
    {/if}

    {#if estado == "importarLink"}
        <div class="link-input">
            <input
                type="text"
                bind:value={inputLink}
                placeholder="Importar video, imagen, link de youtube, bitchute, dailymotion o pornhub"
            />
            <ButtonGroup>
                <Button outlined shaped={true} on:click={importarVideo}>
                    <icon>OK</icon>
                </Button>
                <Button
                    outlined
                    shaped={true}
                    on:click={() => (estado = "vacio")}
                >
                    <icon>x</icon>
                </Button>
            </ButtonGroup>
        </div>
    {/if}
    {#if !media.archivo && estado == "vacio"}
        <span class="opciones">
            Agrega un archivo:
            <ButtonGroup>
                <Button
                    on:click={() => input.click()}
                    icon
                    outlined
                    shaped={true}
                    on:click={() => true}
                >
                    <icon class="fe fe-upload" />
                </Button>
                <Button
                    on:click={() => (spoiler = !spoiler)}
                    icon
                    outlined={!spoiler}
                    raised={spoiler}
                    shaped={true}
                    color=""
                    title="Spoiler"
                    on:click={() => true}
                >
                    <icon class="fe fe-alert-triangle" />
                </Button>
                <Button
                    icon
                    outlined
                    shaped={true}
                    on:click={() => (estado = "importarLink")}
                >
                    <icon class="fe fe-link-2" />
                </Button>
            </ButtonGroup>
        </span>
    {/if}
    {#if media.archivo || media.link}
        <div class="cancelar">
            <ButtonGroup>
                <Button
                    on:click={() => (spoiler = !spoiler)}
                    icon
                    outlined={!spoiler}
                    raised={spoiler}
                    shaped={true}
                    color=""
                    on:click={() => true}
                >
                    <icon class="fe fe-alert-triangle" />
                </Button>
                <Button
                    on:click={removerArchivo}
                    icon
                    outlined
                    shaped={true}
                    on:click={() => true}
                >
                    <icon class="fe fe-x" />
                </Button>
            </ButtonGroup>
        </div>
    {/if}
</div>

<style>
    .opciones {
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: space-evenly;
        height: fit-content;
        margin-top: auto;
    }
    .media-input :global(.cancelar) {
        margin-left: auto;
        align-self: baseline;
        position: absolute;
        right: 16px;
        top: 16px;
    }

    .media-input {
        align-items: flex-end;
        min-height: 64px;
    }

    .compacto {
        height: auto;
        width: 100%;
        margin-left: 0;
        max-height: 300px;
    }

    .link-input {
        height: fit-content;
        display: flex;
        width: 100%;
    }

    video {
        max-height: 600px;
        max-width: 600px;
    }

    .media-input :global(.button-group) {
        flex-wrap: nowrap !important;
    }
</style>
