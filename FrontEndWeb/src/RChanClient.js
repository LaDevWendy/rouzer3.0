import axios from 'axios'
export default class RChanClient {
    // Acciones
    static crearHilo(titulo, categoria, contenido, archivo) {
        let form = new FormData()
        form.append("Titulo", titulo)
        form.append("CategoriaId", categoria)
        form.append("Contenido", contenido)
        form.append("Archivo", archivo)
        return axios.post("/api/Hilo/Crear", form)
    }

    static crearComentario(hiloId, contenido, archivo = null) {
        let form = new FormData();
        form.append('hiloId', hiloId)
        form.append('contenido', contenido)
        form.append('archivo', archivo)
        return axios.post('/api/Comentario/Crear', form)
    }

    static registrase(nick, contraseña) {
        return axios.post('/api/Usuario/Registro', {
            nick,
            contraseña
        })
    }

    static logearse(nick, contraseña) {
        return axios.post('/api/Usuario/Login', {
            nick,
            contraseña
        })
    }
    static agregar(accion, id) {
        return axios.post('/api/Hilo/Agregar', {
            accion, // favoritos | seguidos | ocultos
            hiloId: id
        })
    }
    static limpiarNotificaciones() {
        return axios.post("/api/Notificacion/Limpiar")
    }

    static añadirRol(nick, role) {
        return axios.post("/api/Administracion/AñadirRol", {
            username: nick,
            role
        })
    }

    static removerRol(nick, role) {
        return axios.post("/api/Administracion/RemoverRol", {
            username: nick,
            role
        })
    }

    static añadirSticky(hiloId, global, importancia) {
        return axios.post("/api/Administracion/AñadirSticky", {
            hiloId,
            global,
            importancia: Number(importancia),
        })
    }
    static borrarHilo(hiloId) {
        return axios.post("/api/Administracion/BorrarHilo", {
            hiloId,
        })
    }
    static cambiarCategoria(hiloId, categoriaId) {
        return axios.post("/api/Administracion/CambiarCategoria", {
            hiloId,
            categoriaId,
        })
    }
    //Paginas
    static index(){
        return axios.get("/")
    }
    static hilo(id){
        return axios.get(`/Hilo/${id}`)
    }
    static favoritos(id){
        return axios.get(`/Hilo/Favoritos`)
    }
}