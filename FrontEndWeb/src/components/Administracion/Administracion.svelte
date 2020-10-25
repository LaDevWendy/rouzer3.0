<script>
    import {Button} from 'svelte-mui'
    import RChanClient from '../../RChanClient'
    import ErrorValidacion from '../ErrorValidacion.svelte'

    let model = window.model
    let error = null
    let nick = ""

    async function eliminar(nick, rol) {
        try {
            let res = await RChanClient.removerRol(nick, rol)
            console.log(res)
            alert(res.data.mensaje)
        } catch (e) {
            console.log(e.resposne)
            error = e.response.data
            return
        }
    }

    async function añadir(nick, rol) {
        try {
            let res = await RChanClient.añadirRol(nick, rol)
            console.log(res)
            alert(res.data.mensaje)
        } catch (e) {
            console.log(e.resposne)
            error = e.response.data
            return
        }
    }
    async function actualizarConfig() {
        try {
            let res = await RChanClient.ActualizarConfiguracion(model.config)
            console.log(res)
            alert(res.data.mensaje)
        } catch (e) {
            console.log(e.resposne)
            error = e.response.data
            return
        }
    }

</script>
<main class="administracion">
    <section style="max-width: 400px">
        <h3>Equipo</h3>
        <ErrorValidacion error={error}/>
        <div class="menu">
            <ul >
                <li class="header">Admninistradores</li>
                <li class="noback">
                    <input bind:value = {nick}  type="text" placeholder="Id o nick del usuario"> <Button on:click={() => añadir(nick, "admin")}>Añadir</Button>
                </li>
                {#each model.admins as a (a.id)}
                    <li>{a.userName} <span class="sep"></span><Button on:click={() => eliminar(a.id, "admin")}>Eliminar</Button></li>
                {/each}
                <hr>
                <li class="header">Moderadores(medz)</li>
                <li class="noback">
                    <input type="text" placeholder="Id o nick del usuario"> <Button on:click={() => añadir(nick, "mod")}>Añadir</Button>
                </li>
                {#each model.mods as m (m.id)}
                    <li>{m.userName} <span class="sep"></span><Button on:click={() => eliminar(m.id, "mod")}>Eliminar</Button></li>
                {/each}
            </ul>

        </div>
    </section>

    <section style="max-width: 400px">
        <h3>Configuracion</h3>
        <ErrorValidacion error={error}/>
        <div class="menu">
            <ul >
                <li>LimiteBump <input bind:value={model.config.limiteBump} type="number"></li>
                <li>TiempoEntreComentarios <input bind:value={model.config.tiempoEntreComentarios} type="number"></li>
                <li>TiempoEntreHilos <input bind:value={model.config.tiempoEntreHilos} type="number"></li>
                <li>RegistroAbierto <input bind:checked={model.config.registroAbierto} type="checkbox"></li>
                <li>HilosMaximosPorCategoria <input bind:value={model.config.hilosMaximosPorCategoria} type="number"></li>
                <li>LimiteArchivo <input bind:value={model.config.limiteArchivo} type="number"></li>
                <li class="header"> <span style="margin-right: auto"></span> <Button on:click={actualizarConfig}>Guardar</Button></li>
            </ul>
        </div>
    </section>

</main>

<style>
    main {
        margin: auto;
        display: flex;
        flex-wrap: wrap;
        gap:10px;
        max-width: 1270px;
        margin:auto;
    }
    main > section {
        flex: 1;
    }
    .header {
        background: rgba(255, 255, 255, 0.089) !important;
    }
    .sep{
        margin-left: auto;
    }
    
</style>