import { writable } from 'svelte/store';
import config from './config'
import Cookie from 'js-cookie'

let data = Object.assign({
    mostrarLogin: false,
    mostrarRegistro: false,
    debug: true,
    fondo: 'url(/imagenes/rosed.png)',
    esCelular: false,
}, window.globalState)

// Categorias 
data.categoriasActivas = config.categorias.filter(c => !c.nsfw).map(c => c.id)
if (Cookie.getJSON('categoriasActivas')) {
    if (Cookie.getJSON('version')) {
        let version = Cookie.getJSON('version')[0]
        if (version === "premium") {
            data.categoriasActivas = Cookie.getJSON('categoriasActivas')
            data.version = ["premium"]
        } else {
            data.categoriasActivas = Cookie.getJSON('categoriasActivas')
            data.categoriasActivas = [...data.categoriasActivas, 47]
            data.version = ["premium"]
            Cookie.set('categoriasActivas', data.categoriasActivas)
            Cookie.set('version', data.version)
        }
    } else {
        data.categoriasActivas = Cookie.getJSON('categoriasActivas')
        data.categoriasActivas = [...data.categoriasActivas, 47]
        data.version = ["premium"]
        Cookie.set('categoriasActivas', data.categoriasActivas)
        Cookie.set('version', data.version)
    }
    /*
        data.categoriasActivas = Cookie.getJSON('categoriasActivas')
            // Quitar este despues (es para activar la categoria programacion automaticamente)
        data.categoriasActivas = [...data.categoriasActivas, 46]*/
} else {
    Cookie.set('categoriasActivas', data.categoriasActivas)
    Cookie.set('version', ["premium"])
}


data.gruposActivos = []
if (Cookie.getJSON('gruposActivos')) {
    data.gruposActivos = Cookie.getJSON('gruposActivos')
} else {
    Cookie.set('gruposActivos', data.gruposActivos)
}

// Hide comentarios
let comentariosOcultosStorage = localStorage.getItem('comentariosOcultos')
if (!comentariosOcultosStorage) comentariosOcultosStorage = JSON.stringify(['test'])
data.comentariosOcultos = new Map(JSON.parse(comentariosOcultosStorage).map(e => [e, true]))

// Checkeo si es celular
data.esCelular = window.innerWidth < 600

const store = writable(data)
export default {
    subscribe: store.subscribe,
    set(value) {
        localStorage.setItem('comentariosOcultos', JSON.stringify(Array.from(value.comentariosOcultos.keys())))
        Cookie.set('categoriasActivas', value.categoriasActivas, { expires: 696969 })
        Cookie.set('gruposActivos', value.gruposActivos, { expires: 696969 })
        Cookie.set('version', value.version, { expires: 696969 })
        store.set(value)
    },
    update(config) {
        Cookie.set('categoriasActivas', config.categoriasActivas, { expires: 696969 })
        Cookie.set('gruposActivos', config.gruposActivos, { expires: 696969 })
        Cookie.set('version', config.version, { expires: 696969 })
        store.update(config)
    }
}