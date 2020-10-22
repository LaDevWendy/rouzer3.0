export default class config {
    static categorias =  [{
        "id": 1,
        "nombre": "Arte",
        "nombreCorto": "ART",
        "oculta": false
    }, {
        "id": 2,
        "nombre": "Tecnologia",
        "nombreCorto": "TEC",
        "oculta": false
    }, {
        "id": 3,
        "nombre": "Random",
        "nombreCorto": "UFF",
        "oculta": true
    }]

    static getCategoriaById(id){ return this.categorias[id - 1]} 
}