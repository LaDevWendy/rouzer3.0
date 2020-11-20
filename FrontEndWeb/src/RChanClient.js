import axios from 'axios'
axios.maxRedirects = 0

axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if(response.request.responseURL && response.request.responseURL.indexOf("/Domad") != -1) {
        window.location = response.request.responseURL
    }
    console.log(response.request.responseURL);
    console.log(response);
    if(response.data.redirect) window.location = response.data.redirect;
    return response
    if(response.request.responseURL && response.request.responseURL == "/") {
        window.location = response.request.responseURL
    }

    if(response.request.responseURL && response.request.responseURL.indexOf("/Login") != -1) {
        window.location = "/Login"
    }
    return Promise.resolve(response);
  }, function (error) {
      
        if(error.response.data.redirect){
            console.log(JSON.stringify(error.response))
            window.location = error.response.data.redirect
            return Promise.resolve();
        }
        return Promise.reject(error);
  });

export default class RChanClient {
    // Acciones
    static crearHilo(titulo, categoria, contenido, archivo, link="", captcha="") {
        let form = new FormData()
        form.append("Titulo", titulo)
        form.append("CategoriaId", categoria)
        form.append("Contenido", contenido)
        form.append("Archivo", archivo)
        form.append("Link", link)
        form.append("captcha", captcha)
        return axios.post("/api/Hilo/Crear", form)
    }

    static crearComentario(hiloId, contenido, archivo = null, link="", captcha="") {
        let form = new FormData();
        form.append('hiloId', hiloId)
        form.append('contenido', contenido)
        form.append('archivo', archivo)
        form.append("Link", link)
        form.append('captcha', captcha)
        return axios.post('/api/Comentario/Crear', form)
    }

    static registrase(nick, contraseña, captcha) {
        return axios.post('/api/Usuario/Registro', {
            nick,
            contraseña,
            captcha
        })
    }

    static logearse(nick, contraseña) {
        return axios.post('/api/Usuario/Login', {
            nick,
            contraseña
        })
    }
    static deslogearse() {
        return axios.post('/logout')
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

    static ActualizarConfiguracion(config) {
        return axios.post("/api/Administracion/ActualizarConfiguracion", config)
    }

    static Denunciar(tipo, hiloId, motivo, aclaracion, comentarioId) {
        return axios.post("/api/Hilo/Denunciar", {
            tipo,
            hiloId,
            motivo,
            aclaracion,
            comentarioId
        })
    }
    static banear(motivo, aclaracion, duracion, usuarioId, hiloId="", comentarioId="", eliminarElemento=true, eliminarAdjunto=false) {
        return axios.post("/api/Moderacion/Banear", {
            motivo,
            aclaracion,
            duracion,
            eliminarElemento,
            eliminarAdjunto,
            hiloId,
            comentarioId
        })
    }

    static cargarMasHilos(ultimoBump, categorias){
        return axios.get('api/Hilo/CargarMas', {
            params:{
                ultimoBump,
                categorias: categorias.join(",")
            }
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

    //Denuncias
    static rechazarDenuncia(denunciaId)
    {
        return axios.post(`/api/Moderacion/RechazarDenuncia/${denunciaId}`)
    }

    static eliminarComentarios(ids)
    {
        return axios.post(`/api/Moderacion/EliminarComentarios`, ids)
    }

    static removerBan(id)
    {
        return axios.post(`/api/Moderacion/RemoverBan/${id}`)
    }
}