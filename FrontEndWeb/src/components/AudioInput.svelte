<script>
    import { onMount } from "svelte";
    import { Button, Dialog } from "svelte-mui";
    import globalStore from "../globalStore";

    const segundosATiempo = (numeroDeSegundos) => {
        let horas = Math.floor(numeroDeSegundos / 60 / 60);
        numeroDeSegundos -= horas * 60 * 60;
        let minutos = Math.floor(numeroDeSegundos / 60);
        numeroDeSegundos -= minutos * 60;
        numeroDeSegundos = parseInt(numeroDeSegundos);
        if (horas < 10) horas = "0" + horas;
        if (minutos < 10) minutos = "0" + minutos;
        if (numeroDeSegundos < 10) numeroDeSegundos = "0" + numeroDeSegundos;

        return `${horas}:${minutos}:${numeroDeSegundos}`;
    };

    let listaDeDispositivos = [];
    let duracion = segundosATiempo(0),
        tiempoInicio,
        mediaRecorder,
        idIntervalo;

    const refrescar = () => {
        let tiempo = (Date.now() - tiempoInicio) / 1000;
        duracion = segundosATiempo(tiempo);
        if (tiempo > 300) {
            detenerGrabacion();
        }
    };

    // Consulta la lista de dispositivos de entrada de audio y llena el select
    const llenarLista = () => {
        navigator.mediaDevices.enumerateDevices().then((dispositivos) => {
            listaDeDispositivos = [];
            dispositivos.forEach((dispositivo, indice) => {
                if (dispositivo.kind === "audioinput") {
                    let opcion = {
                        text: dispositivo.label || `Dispositivo ${indice + 1}`,
                        value: dispositivo.deviceId,
                    };
                    listaDeDispositivos.push(opcion);
                }
            });
        });
    };
    // Ayudante para la duración; no ayuda en nada pero muestra algo informativo
    const comenzarAContar = () => {
        tiempoInicio = Date.now();
        idIntervalo = setInterval(refrescar, 500);
    };

    let dispositivo;
    let estado = false;
    export let blobAudio;
    let urlBlobAudio;
    // Comienza a grabar el audio con el dispositivo seleccionado
    const comenzarAGrabar = () => {
        if (!listaDeDispositivos.length) return alert("No hay dispositivos");
        // No permitir que se grabe doblemente
        if (mediaRecorder) {
            detenerGrabacion();
            return;
        }
        navigator.mediaDevices
            .getUserMedia({
                audio: {
                    deviceId: dispositivo,
                },
            })
            .then((stream) => {
                // Comenzar a grabar con el stream
                estado = true;
                blobAudio = null;
                urlBlobAudio = null;
                mediaRecorder = new MediaRecorder(stream, {
                    mimeType: "audio/webm",
                });
                mediaRecorder.start();
                comenzarAContar();
                // En el arreglo pondremos los datos que traiga el evento dataavailable
                const fragmentosDeAudio = [];
                // Escuchar cuando haya datos disponibles
                mediaRecorder.addEventListener("dataavailable", (evento) => {
                    // Y agregarlos a los fragmentos
                    fragmentosDeAudio.push(evento.data);
                });
                // Cuando se detenga (haciendo click en el botón) se ejecuta esto
                mediaRecorder.addEventListener("stop", () => {
                    // Detener el stream
                    stream.getTracks().forEach((track) => track.stop());
                    // Detener la cuenta regresiva
                    detenerConteo();
                    // Convertir los fragmentos a un objeto binario
                    blobAudio = new Blob(fragmentosDeAudio);
                    urlBlobAudio = URL.createObjectURL(blobAudio);
                });
            })
            .catch((error) => {
                // Aquí maneja el error, tal vez no dieron permiso
                estado = false;
                console.log(error);
            });
    };

    const detenerConteo = () => {
        clearInterval(idIntervalo);
        tiempoInicio = null;
        duracion = segundosATiempo(0);
    };

    const detenerGrabacion = () => {
        if (!mediaRecorder) return alert("No se está grabando");
        mediaRecorder.stop();
        mediaRecorder = null;
        estado = false;
    };

    export function removerArchivo() {
        blobAudio = null;
        urlBlobAudio = null;
        duracion = segundosATiempo(0);
    }

    // Cuando ya hemos configurado lo necesario allá arriba llenamos la lista
    onMount(() => {
        const tieneSoporteUserMedia = () =>
            !!navigator.mediaDevices.getUserMedia({ audio: true });

        // Si no soporta...
        // Amable aviso para que el mundo comience a usar navegadores decentes ;)
        if (typeof MediaRecorder === "undefined" || !tieneSoporteUserMedia())
            alert(
                "Tu navegador web no cumple los requisitos; por favor, actualiza a un navegador decente como Firefox o Google Chrome"
            );
        llenarLista();
    });

    let visible = false;
</script>

<div class="recording">
    {#if urlBlobAudio}
        <Button
            icon
            color="red"
            class="record"
            on:click={removerArchivo}
            title="Descartar audio"
        >
            <icon class="fe fe-x" />
        </Button>
        <audio
            class="controls"
            controls="controls"
            style="height: 32px; border-radius: 16px;"
        >
            <source src={urlBlobAudio} type="audio/mp3" />
        </audio>
    {:else}
        {#if !$globalStore.usuario.estaAutenticado}
            <Button
                icon
                color="green"
                class="record"
                on:mousedown={() => (window.location = "/Inicio")}
                on:touchstart={() => (window.location = "/Inicio")}
                title="Mantener presionado para grabar"
            >
                <icon class="fe fe-mic" />
            </Button>
        {:else}
            <Button
                icon
                color="green"
                class="record"
                on:mousedown={comenzarAGrabar}
                on:mouseup={detenerGrabacion}
                on:mouseout={() => {
                    if (estado) detenerGrabacion();
                }}
                on:touchstart={comenzarAGrabar}
                on:touchend={detenerGrabacion}
                title="Mantener presionado para grabar"
            >
                <icon class="fe fe-mic" />
            </Button>
        {/if}
        <div
            class="controls"
            style={estado ? "color: green;" : ""}
            id="duracion"
        >
            {duracion}
        </div>
        {#if estado}
            <div class="controls shake">
                <icon class="fe fe-voicemail" />
            </div>
        {:else}
            <Button
                icon
                color="grey"
                class="settings"
                on:click={() => (visible = true)}
                title="Configuración"
            >
                <icon class="fe fe-settings" />
            </Button>
        {/if}
    {/if}
</div>

<Dialog width="320" bind:visible>
    <div slot="title">Seleccionar dispositivo</div>
    <select bind:value={dispositivo} name="listaDeDispositivos">
        {#each listaDeDispositivos as opcion (opcion.value)}
            <option value={opcion.value}>{opcion.text}</option>
        {/each}
    </select>
    <div slot="actions" class="actions center">
        <Button color="primary" on:click={() => (visible = false)}>OK</Button>
    </div>
</Dialog>

<style>
    .recording {
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        flex-wrap: wrap-reverse;
    }
    .recording :global(.record) {
        width: 39px;
        height: 39px;
        font-size: 26px;
        margin: 10px;
    }
    .recording :global(.record::before) {
        background-color: currentColor;
        opacity: 0.15;
    }
    .recording :global(.record:hover::before) {
        opacity: 0.3 !important;
    }
    .controls {
        margin-top: 10px;
        margin-bottom: 10px;
        margin-left: 20px;
        margin-right: 20px;
    }
    .shake {
        animation: shake 0.5s;
        animation-iteration-count: infinite;
    }
    .recording :global(.settings) {
        margin: 10px;
    }

    @keyframes shake {
        0% {
            transform: translate(1px, 1px) rotate(0deg);
        }
        10% {
            transform: translate(-1px, -2px) rotate(-1deg);
        }
        20% {
            transform: translate(-3px, 0px) rotate(1deg);
        }
        30% {
            transform: translate(3px, 2px) rotate(0deg);
        }
        40% {
            transform: translate(1px, -1px) rotate(1deg);
        }
        50% {
            transform: translate(-1px, 2px) rotate(-1deg);
        }
        60% {
            transform: translate(-3px, 1px) rotate(0deg);
        }
        70% {
            transform: translate(3px, 1px) rotate(-1deg);
        }
        80% {
            transform: translate(-1px, -1px) rotate(1deg);
        }
        90% {
            transform: translate(1px, 2px) rotate(0deg);
        }
        100% {
            transform: translate(1px, -2px) rotate(-1deg);
        }
    }
</style>
