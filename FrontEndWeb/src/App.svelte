<script>
	import Comentarios from "./components/Comentarios/Comentarios.svelte";
	import Acciones from "./components/Acciones.svelte";
	import Tiempo from "./components/Tiempo.svelte";
	import { Button, Dialog, Checkbox, Textfield } from "svelte-mui";
	import config from "./config";
	import RChanClient from "./RChanClient";
	import ErrorValidacion from "./components/ErrorValidacion.svelte";
	import globalStore from "./globalStore";
	import Dialogo from "./components/Dialogo.svelte";
	import Media from "./components/Media.svelte";
	import HiloCuerpo from "./components/Hilos/HiloCuerpo.svelte";
	import { abrir } from "./components/Dialogos/Dialogos.svelte";
	import Encuesta from "./components/Hilos/Encuesta.svelte";
	import { HiloEstado } from "./enums";
	import { onMount, tick } from "svelte";
	import MediaType from "./MediaType";
	import { Flag } from "./enums";

	let data = window.data || dataEjemplo;
	let { hilo, comentarios, acciones, usuario, spams, contadores } = data;
	let comentarioStore = "";

	let dialogs = {
		sticky: {
			global: true,
			importancia: 1,
			async accion() {
				return await RChanClient.añadirSticky(
					hilo.id,
					dialogs.sticky.global,
					dialogs.sticky.importancia
				);
			},
		},
		categoria: { categoriaId: hilo.categoriaId },
		flag: {
			flag: "",
			async accion() {
				return await RChanClient.añadirFlag(hilo.id, dialogs.flag.flag);
			},
		},
	};

	function agregarVotoAFormulario(opcion) {
		if (typeof opcion != "string") opcion = opcion.detail;
		comentarioStore = `[${opcion}]\n\n` + comentarioStore;
	}
</script>

<div class="hilo-completo" r-id={hilo.id}>
	<div class="contenido">
		<div class="panel">
			<a href="/">{config.nombre}</a>
			<a href="/{config.categoriaPorId(hilo.categoriaId).nombreCorto}"
				>/{config.categoriaPorId(hilo.categoriaId).nombre}</a
			>
		</div>

		{#if $globalStore.usuario.esAuxiliar}
			{#if hilo.estado == 2}
				<span style="color:red"
					>Este roz esta eliminado y pronto sera borrado</span
				>
			{/if}
			<div class="acciones-mod panel">
				{#if $globalStore.usuario.esAdmin}
					<Dialogo
						textoActivador="Flag"
						titulo="Configurar flag"
						accion={dialogs.flag.accion}
					>
						<div slot="body">
							<p>Agregar o quitar flag</p>
							<select bind:value={dialogs.flag.flag} name="flag">
								<option value="-1" selected disabled
									>Flag</option
								>
								{#each Object.keys(Flag) as k}
									<option value={Flag[k]}>{k}</option>
								{/each}
							</select>
						</div>
					</Dialogo>
				{/if}
				{#if $globalStore.usuario.esMod}
					<Dialogo
						textoActivador="Sticky"
						titulo="Configurar Sticky"
						accion={dialogs.sticky.accion}
					>
						<div slot="body">
							<p>
								(Los stickies no globales solo aparecen en su
								categoria)
							</p>
							<Checkbox bind:checked={dialogs.sticky.global}>
								<span>Global</span>
							</Checkbox>
							<p>
								(Un sticky de importancia 2 sale primero que un
								sticky de importancia 1 )
							</p>
							<Textfield
								autocomplete="off"
								label="Importancia"
								type="number"
								required
								bind:value={dialogs.sticky.importancia}
								message=""
							/>
						</div>
					</Dialogo>
				{/if}
				<Button on:click={() => abrir.cambiarCategoria(hilo.id)}
					>Categoria</Button
				>
				{#if hilo.estado != HiloEstado.eliminado}
					<Button on:click={() => abrir.eliminarHilo(hilo.id)}
						>Eliminar</Button
					>
				{:else}
					<Button on:click={() => abrir.restaurarHilo(hilo.id)}
						>Restaurar</Button
					>
				{/if}
				<Button on:click={() => abrir.ban(hilo.id)}>Banear</Button>
				{#if $globalStore.usuario.esMod}
					{#if hilo.media && hilo.media != MediaType.Eliminado}
						<Button
							on:click={() =>
								abrir.eliminarMedia([hilo.media.id])}
							>Eliminar media</Button
						>
					{/if}
					<a href="/Moderacion/HistorialDeUsuario/{usuario.id}">
						<Button>Op</Button>
					</a>
				{/if}
			</div>
		{/if}

		<Acciones {hilo} bind:acciones {contadores} />
		{#if hilo.encuestaData}
			<Encuesta
				bind:encuesta={hilo.encuestaData}
				hiloId={hilo.id}
				on:agregarVotoAFormulario={agregarVotoAFormulario}
			/>
		{/if}

		<HiloCuerpo {hilo} />
	</div>
	<Comentarios
		{comentarios}
		{hilo}
		{spams}
		bind:hide={acciones.hideado}
		bind:comentarioStore
	/>
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
	.hilo-completo :global(.cuerpo) {
		position: sticky;
		/* top: 10px; */
		top: 60px;
		position: -webkit-sticky;
		max-height: calc(100vh - 75px);
		overflow-x: hidden;
		overflow-y: auto;
	}
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
			margin-top: 10px;
		}
	}
	@media (max-width: 600px) {
		a {
			font-weight: bold;
		}
		.hilo-completo :global(.cuerpo) {
			max-height: unset;
		}
	}
</style>
