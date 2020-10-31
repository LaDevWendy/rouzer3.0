export default class config {
    static categorias =  window.config.categorias

    static getCategoriaById(id){ return this.categorias[id - 1]} 
}