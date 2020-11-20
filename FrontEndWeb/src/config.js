export default class config {
    static categorias =  window.config.categorias.sort((a, b) => a.id - b.id)

    static general = window.config.general

    static getCategoriaById(id){ return this.categorias[id - 1]} 
}