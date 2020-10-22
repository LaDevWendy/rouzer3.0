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

</main>

<style>
    main {
        margin: auto;
    }
    .header {
        background: rgba(255, 255, 255, 0.089) !important;
    }
    .sep{
        margin-left: auto;
    }
    
</style>