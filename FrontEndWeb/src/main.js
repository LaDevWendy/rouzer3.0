import App from './App.svelte';
import Navbar from './components/Navbar.svelte';
import HiloList from './components/Hilos/HiloList.svelte';
import Administracion from './components/Administracion/Administracion.svelte';
import Moderacion from './components/Paginas/Moderacion.svelte';
import Sesion from './components/Paginas/Sesion.svelte';
import HistorialUsuario from './components/Paginas/HistorialUsuario.svelte';

// const app = new App({
// 	target: document.body,
// 	props: {
// 		name: 'world'
// 	}
// });

let componentes = [
	["#svelte", App, {}],
	["#svelte-navbar", Navbar, {}],
	["#svelte-index", HiloList, {hiloList: window.hiloList}],
	["#svelte-administracion", Administracion, {}],
	["#svelte-moderacion", Moderacion, {}],
	["#svelte-login", Sesion, {}],
	["#svelte-historialDeUsuario", HistorialUsuario, {}],
	["#svelte-registro", Sesion, {modo:"registro"}],
]

for (const c of componentes) {
	if(document.querySelector(c[0]))
	{	
		new c[1]({
			target: document.querySelector(c[0]),
			props: c[2]
		});
	}
	
}