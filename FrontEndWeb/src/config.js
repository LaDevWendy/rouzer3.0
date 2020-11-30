let sfw = window.config.categorias
    .filter(c => !c.nsfw).sort((c1, c2) => c1.nombre.localeCompare(c2.nombre))

let nsfw = window.config.categorias
    .filter(c => c.nsfw).sort((c1, c2) => c1.nombre.localeCompare(c2.nombre))

let categoriasOrdenadas = [...sfw, ...nsfw]

export default class config {
    static categorias =  categoriasOrdenadas


    static general = window.config.general

    static getCategoriaById(id){ return this.categorias[id - 1]} 
}