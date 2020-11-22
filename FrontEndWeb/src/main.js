import App from './App.svelte';
import Navbar from './components/Navbar.svelte';
import HiloList from './components/Hilos/HiloList.svelte';
import Administracion from './components/Administracion/Administracion.svelte';
import Moderacion from './components/Paginas/Moderacion.svelte';
import Login from './components/Paginas/Login.svelte';
import Registro from './components/Paginas/Registro.svelte';
import HistorialUsuario from './components/Paginas/HistorialUsuario.svelte';
import Domado from './components/Paginas/Domado.svelte';
import ListaDeUsuarios from './components/Paginas/ListaDeUsuarios.svelte';
import EliminadosYDesactivados from './components/Paginas/EliminadosYDesactivados.svelte';

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
	["#svelte-login", Login, {}],
	["#svelte-historialDeUsuario", HistorialUsuario, {}],
	["#svelte-registro", Registro],
	["#svelte-domado", Domado, {}],
	["#svelte-listaDeUsuarios", ListaDeUsuarios, {}],
	["#svelte-eliminadosYDesactivados", EliminadosYDesactivados, {}],
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