export default class config {
    static categorias =  window.config.categorias

    static general = window.config.general

    static getCategoriaById(id){ return this.categorias[id - 1]} 
}