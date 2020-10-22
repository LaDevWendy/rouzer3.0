import App from './App.svelte';
import Navbar from './components/Navbar.svelte';
import HiloList from './components/Hilos/HiloList.svelte';
import Administracion from './components/Administracion/Administracion.svelte';

// const app = new App({
// 	target: document.body,
// 	props: {
// 		name: 'world'
// 	}
// });
if(document.querySelector("#svelte"))
{
	const app1 = new App({
		target: document.querySelector("#svelte"),
		props: {
		}
	});
}

const navbar = new Navbar({
	
	target: document.querySelector("#svelte-navbar")
})

if(document.querySelector("#svelte-index")){
	const hiloList = new HiloList({
		target: document.querySelector("#svelte-index"),
		props: {
			hiloList: window.hiloList
		}
	})
}
if(document.querySelector("#svelte-administracion")){
	const hiloList = new Administracion({
		target: document.querySelector("#svelte-administracion"),
		props: {
			// hiloList: window.hiloList
		}
	})
}

export default app;