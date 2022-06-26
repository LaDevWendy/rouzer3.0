import { writable } from 'svelte/store'
import Signal from './signal'

let gruposOrdenados = window.config.grupos.sort((g1, g2) => g1.id - g2.id)

let sfw = window.config.categorias.filter(c => !c.nsfw).sort((c1, c2) => c1.nombre.localeCompare(c2.nombre))

let nsfw = window.config.categorias.filter(c => c.nsfw).sort((c1, c2) => c1.nombre.localeCompare(c2.nombre))

let categoriasOrdenadas = [...sfw, ...nsfw]

export default class config {

    static grupos = gruposOrdenados

    static categorias = categoriasOrdenadas

    static nombre = window.config.general.nombre

    static autoBumps = window.config.autoBumps

    static mensajesGlobales = window.config.mensajesGlobales

    static membrecias = window.config.membrecias

    static rouzcoins = window.config.rouzCoins

    static metodosdepago = window.config.metodosDePago

    static categoriaPorId(id) {
        return config.categorias.filter(c => c.id == id)[0]
    }

    static grupoPorId(id) {
        return config.grupos.filter(g => g.id == id)[0]
    }


    static general = window.config.general

    static getCategoriaById(id) { return this.categorias[id - 1] }
}

export let configStore = writable({
    categorias: categoriasOrdenadas,
    general: window.config.general,
    categoriaPorId(id) {
        return config.categorias.filter(c => c.id == id)[0]
    }
})

Signal.subscribirARozed()
Signal.coneccion.on("configuracionActualizada", (nuevaConfig) => {
    configStore.update(c => {
        c.general = nuevaConfig
        return c;
    })
})