<script>
	import Comentarios from './components/Comentarios/Comentarios.svelte'
	import Acciones from './components/Acciones.svelte'
	import Tiempo from './components/Tiempo.svelte'
	import {Button,Dialog, Checkbox, Textfield} from 'svelte-mui'

	import config from './config'
	import RChanClient from './RChanClient';
	import ErrorValidacion from './components/ErrorValidacion.svelte'
	import globalStore from './globalStore'
	import Dialogo from './components/Dialogo.svelte'
	import Media from './components/Media.svelte'
	import HiloCuerpo from './components/Hilos/HiloCuerpo.svelte'
	import {abrir} from './components/Dialogos/Dialogos.svelte'


	let data = window.data || dataEjemplo
	let {hilo, comentarios, acciones, usuario} = data;

	let dialogs =  {
		sticky : {
			global: true,
			importancia: 1,
			async accion() {
					return await  RChanClient.añadirSticky(hilo.id, dialogs.sticky.global, dialogs.sticky.importancia )
			}
		},
		categoria: {categoriaId: hilo.categoriaId}
	}

	let selected = true
</script>

<div class="hilo-completo" r-id={hilo.id}>
	<div class="contenido">
		<div class="panel">
			<a href="/">Rozed</a>
			<a href="/{config.getCategoriaById(hilo.categoriaId).nombreCorto}">/{config.getCategoriaById(hilo.categoriaId).nombre}</a>
		</div>

		<Acciones bind:hilo bind:acciones/>
		
		{#if $globalStore.usuario.esMod}
		{#if hilo.estado == 2 }
			<span style="color:red">Este roz esta eliminado y pronto sera borrado</span>
		{/if}
			<div class="acciones-mod panel">

				<Dialogo textoActivador="Sticky" titulo="Configurar Sticky" accion = {dialogs.sticky.accion}>
					<div slot="body">
						<p>(Los stickies no globales solo aparecen en su categoria)</p>
						<Checkbox bind:checked={dialogs.sticky.global}>
							<span>Global</span>
						</Checkbox>
						<p>(Un sticky de importancia 2 sale primero que un sticky de importancia 1 )</p>
						<Textfield
							autocomplete="off"
							label="Importancia"
							type="number"
							required
							bind:value = {dialogs.sticky.importancia}
							message=""
						/>
					</div>
				</Dialogo>
				
				<Dialogo textoActivador="Categoria" titulo="Cambiar categoria" accion = {() => RChanClient.cambiarCategoria(hilo.id, dialogs.categoria.categoriaId)}>
					<div slot="body">
						<span asp-validation-for="CategoriaId"></span>
						<select bind:value={dialogs.categoria.categoriaId}  name="categoria">
							<option value="-1" selected="selected" disabled="disabled">Categoría</option>
							{#each config.categorias as c}
							<option value="{c.id}">{c.nombre}</option>
							{/each}
						</select>
						
					</div>
				</Dialogo>

				<Button on:click={() => abrir.eliminarHilo(hilo.id)} >Eliminar</Button>

				<Button on:click={() => abrir.ban(hilo.id)}>Banear</Button>
				<a href="/Moderacion/HistorialDeUsuario/{usuario.id}">
					<Button>Op</Button>
				</a>
			</div>
		{/if}

	<HiloCuerpo {hilo}/>
	</div>
	<Comentarios bind:comentarios {hilo}/>
</div>


<style>
.hilo-completo {
	display: grid;
	grid-template-columns: calc(50% - 10px) 50%;
	gap: 10px;
	width: 100%;
}

/* @media (max-width: 992px) {
} */
@media (max-width: 992px) {
	.hilo-completo {
		grid-template-columns: calc(40% - 10px) 60%;
	}
}

/* .hilo-completo {
	grid-template-columns: calc(40% - 10px) 60%;
} */

@media (max-width: 768px) {
	.hilo-completo {
		grid-template-columns: 100%;
	}
}

</style>