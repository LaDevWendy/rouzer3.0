import {writable} from 'svelte/store'
import App from './App.svelte';
const store = writable({
    componentePrimario : null,
    cargando:false,
})

store.cargarHilo = async function (hiloId) {
    window.model = {
		"comentarios": [
		  {
			"hiloId": null,
			"usuarioId": "b21f6ba5-2019-4937-833b-22beb0d26d42",
			"estado": 0,
			"username": null,
			"id": "88F4URH2",
			"contenido": "asf",
			"creacion": "2021-02-26T20:39:35.572718-03:00",
			"esOp": true,
			"media": null,
			"idUnico": "9NZ",
			"color": "serio",
			"dados": -1,
			"banderita": null
		  }
		],
		"usuario": {
		  "notificaciones": null,
		  "creacion": "2020-11-26T18:22:24.067245-03:00",
		  "id": "b21f6ba5-2019-4937-833b-22beb0d26d42",
		  "userName": "pepe",
		  "normalizedUserName": "PEPE",
		  "lockoutEnd": null
		},
		"hilo": {
		  "cantidadComentarios": 0,
		  "nuevo": false,
		  "titulo": "Banderitos serio",
		  "id": "OCGW4VBY3HGKH25SMJOE",
		  "sticky": 0,
		  "bump": "2021-02-26T20:39:35.579532-03:00",
		  "categoriaId": 35,
		  "contenido": "\u003cspan class=\u0022verde\u0022\u003e\u0026gt;\u0026gt;banderitas\u003c/span\u003e\n\u003cspan class=\u0022verde\u0022\u003e\u0026gt;\u0026gt;serio\u003c/span\u003e",
		  "creacion": "2021-02-26T20:39:33.223119-03:00",
		  "media": {
			"url": "730d46e1656301158e227edbe8ed3b05.png",
			"vistaPrevia": "/Media/P_730d46e1656301158e227edbe8ed3b05.jpg",
			"vistaPreviaCuadrado": "/Media/PC_730d46e1656301158e227edbe8ed3b05.jpg",
			"hash": "730d46e1656301158e227edbe8ed3b05",
			"tipo": 0,
			"esGif": false,
			"id": "730d46e1656301158e227edbe8ed3b05",
			"creacion": "2021-02-26T20:39:33.372487-03:00"
		  },
		  "thumbnail": null,
		  "estado": 0,
		  "rango": 0,
		  "nombre": "",
		  "dados": false,
		  "encuesta": false,
		  "encuestaData": null,
		  "historico": false,
		  "serio": true,
		  "concentracion": false
		},
		"acciones": {
		  "usuarioId": "b21f6ba5-2019-4937-833b-22beb0d26d42",
		  "hiloId": "OCGW4VBY3HGKH25SMJOE",
		  "seguido": true,
		  "favorito": false,
		  "hideado": false,
		  "id": "A31W3F0FP7VF39T2IVWW",
		  "creacion": "2021-02-26T20:39:33.487533-03:00"
		},
		"rango": 0,
		"spams": [],
		"nombre": null
      }
      store.set({componentePrimario : App, cargando : false})
}

export default store;