import { localStore } from '../../localStore'
let configInicial = {
    fondoAburrido: false,
    colorFondo: "#101923",
    usarImagen: false,
    imagen: "/imagenes/rosed.png",
    modoCover: true,
    scrollAncho: false,
    tagClasico: false,
    catClasicas: false,
    palabrasHideadas: "",
    usarColorPersonalizado: false,
    colorPersonalizado: 'blue',
    mutearRisas: false,
}

// Cargo configuracion gudardada
export default localStore('ajustes_config', configInicial)