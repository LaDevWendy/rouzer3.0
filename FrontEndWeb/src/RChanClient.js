import axios from 'axios'
axios.maxRedirects = 0

axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (response && response.data && response.data.redirect) { //??quitado
        console.log(response.data.redirect);
        window.location.href = response.data.redirect
        // throw new Error("Redirigido")
        return
    }
    // if(response?.data?.redirect || false){ //??quitado
    //     window.location.href = response.data.redirect
    //     throw new Error("Redirigido")
    // }
    // if(response.request.responseURL && response.request.responseURL.indexOf("/Domad") != -1) {
    //     window.location = response.request.responseURL
    // }
    // if(response.data.redirect) window.location = response.data.redirect;
    return response
}, function (error) {

    // if(error?.response?.data.redirect){
    if (error.response && error.response.data && error.response.data.redirect) {
        console.log(JSON.stringify(error.response))
        window.location = error.response.data.redirect
        return Promise.resolve();
    }
    return Promise.reject(error);
});

axios.interceptors.request.use(function (config) {
    // Do something before request is sent
    config.headers["RequestVerificationToken"] = window.token
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

export default class RChanClient {
    // Acciones
    static crearHilo(titulo, categoria, contenido, fingerPrint, archivo, link = "", audio = null, captcha = "", encuesta = [], mostrarNombre = false, mostrarRango = false, mostrarRangoAdmin = false, mostrarRangoDev = false) {
        let form = new FormData()
        form.append("Titulo", titulo)
        form.append("CategoriaId", categoria)
        form.append("Contenido", contenido)
        form.append("Archivo", archivo)
        form.append("Link", link)
        form.append("captcha", captcha)
        form.append("encuesta", JSON.stringify(encuesta))
        if (mostrarNombre || mostrarRango || mostrarRangoAdmin || mostrarRangoDev) {
            form.append('MostrarNombre', mostrarNombre)
            form.append('MostrarRango', mostrarRango)
            form.append('MostrarRangoAdmin', mostrarRangoAdmin)
            form.append('MostrarRangoDev', mostrarRangoDev)
        }
        form.append("Audio", audio);
        form.append("FingerPrint", fingerPrint);
        return axios.post("/api/Hilo/Crear", form)
    }

    static crearComentario(hiloId, contenido, fingerPrint, archivo = null, link = "", audio = null, captcha = "", mostrarNombre = false, mostrarRango = false, mostrarRangoAdmin = false, mostrarRangoDev = false) {
        let form = new FormData();
        form.append('HiloId', hiloId)
        form.append('Contenido', contenido)
        form.append('Archivo', archivo)
        form.append("Link", link)
        form.append('captcha', captcha)
        if (mostrarNombre || mostrarRango || mostrarRangoAdmin || mostrarRangoDev) {
            form.append('MostrarNombre', mostrarNombre)
            form.append('MostrarRango', mostrarRango)
            form.append('MostrarRangoAdmin', mostrarRangoAdmin)
            form.append('MostrarRangoDev', mostrarRangoDev)
        }
        form.append("Audio", audio)
        form.append("FingerPrint", fingerPrint)
        return axios.post('/api/Comentario/Crear', form)
    }

    static registrase(nick, contraseña, captcha, fingerPrint, codigoDeInvitacion = "") {
        return axios.post('/api/Usuario/Registro', {
            nick,
            contraseña,
            captcha,
            codigo: codigoDeInvitacion,
            fingerPrint,
        })
    }

    static restaurarSesion(token, fingerPrint) {
        return axios.post('/api/Usuario/RestaurarSesion', {
            token,
            fingerPrint
        })
    }
    static inicio(captcha, fingerPrint, codigoDeInvitacion = "") {
        return axios.post('/api/Usuario/Inicio', {
            captcha,
            codigo: codigoDeInvitacion,
            fingerPrint
        })
    }

    static logearse(nick, contraseña, fingerPrint) {
        return axios.post('/api/Usuario/Login', {
            nick,
            contraseña,
            fingerPrint
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

    static refrescarOnlines() {
        return axios.post("/api/Administracion/RefrescarOnlines")
    }

    static añadirSticky(hiloId, global, importancia) {
        return axios.post("/api/Moderacion/AñadirSticky", {
            hiloId,
            global,
            importancia: Number(importancia),
        })
    }
    static borrarHilos(ids, borrarMedia = false, borrarAudio = false, password = "") {
        return axios.post("/api/Moderacion/BorrarHilo", {
            ids,
            borrarMedia,
            borrarAudio,
            password
        })
    }
    static borrarHilo(id, borrarMedia = false) {
        return RChanClient.borrarHilos([id], borrarMedia)
    }
    static cambiarCategoria(hiloId, categoriaId, advertencia = false) {
        return axios.post("/api/Moderacion/CambiarCategoria", {
            hiloId,
            categoriaId,
            advertencia,
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
    static banear(motivo, aclaracion, duracion, usuarioId, hiloId = "", comentarioId = "", eliminarElemento = true, eliminarAdjunto = false, eliminarAudio = false, desaparecer = false, password = "") {
        return axios.post("/api/Moderacion/Banear", {
            motivo,
            aclaracion,
            duracion,
            eliminarElemento,
            eliminarAdjunto,
            eliminarAudio,
            hiloId,
            comentarioId,
            desaparecer,
            password
        })
    }

    static cargarMasHilos(ultimoBump, ultimoCreacion, ultimoTrend, categorias, serios = false, nuevos = false, tendencias = false) {
        return axios.get('api/Hilo/CargarMas', {
            params: {
                ultimoBump,
                ultimoCreacion,
                ultimoTrend,
                categorias: categorias.join(","),
                serios,
                nuevos,
                tendencias
            }
        })
    }
    //Paginas
    static index() {
        return axios.get("/")
    }
    static hilo(id) {
        return axios.get(`/Hilo/${id}`)
    }
    static favoritos(id) {
        return axios.get(`/Hilo/Favoritos`)
    }

    //Denuncias
    static rechazarDenuncia(denunciaId) {
        return axios.post(`/api/Moderacion/RechazarDenuncia/${denunciaId}`)
    }

    static eliminarComentarios(ids, borrarMedia = false, borrarAudio = false, password = "") {
        return axios.post(`/api/Moderacion/EliminarComentarios`, {
            ids,
            borrarMedia,
            borrarAudio,
            password
        })
    }

    static removerBan(id) {
        return axios.post(`/api/Moderacion/RemoverBan/${id}`)
    }

    static restaurarRoz(id) {
        return axios.post(`/api/Moderacion/RestaurarHilo/${id}`)
    }
    static restaurarComentario(id) {
        return axios.post(`/api/Moderacion/RestaurarComentario/${id}`)
    }
    static generarNuevoLinkDeInvitacion() {
        return axios.post(`/api/Administracion/GenerarNuevoLinkDeInvitacion`)
    }
    static eliminarMedias(ids, password) {
        return axios.post(`/api/Moderacion/EliminarMedia`, { ids, password })
    }
    static eliminarMedia(mediaId, password) {
        let ids = [mediaId]
        return axios.post(`/api/Moderacion/EliminarMedia`, { ids, password })
    }
    static limpiarRozesViejos() {
        return axios.post(`/api/Administracion/LimpiarRozesViejos`)
    }

    static buscar(cadenaDeBusqueda) {
        return axios.post(`/api/Hilo/Buscar?busqueda=${cadenaDeBusqueda}`)
    }
    static votarEncuesta(hiloId, opcion) {
        return axios.post(`/api/Hilo/VotarEncuesta`, { hiloId, opcion })
    }

    static hackYoutube(link) {
        return axios.get(`/api/Otros/YoutubeAArchivo?url=${link}`)
    }

    static crearSpam(urlImagen, link, duracion) {
        return axios.post('/api/Administracion/CrearSpam', {
            urlImagen,
            link,
            duracion
        })
    }
    static eliminarSpam(id) {
        return axios.post('/api/Administracion/EliminarSpam', {
            id
        })
    }

    static toggleSticky(id) {
        return axios.post(`/api/Comentario/Stickear/${id}`)
    }

    static toggleIgnorar(id) {
        return axios.post(`/api/Comentario/Ignorar/${id}`)
    }

    //Apelaciones
    static aceptarApelacion(apelacionId) {
        return axios.post(`/api/Administracion/AceptarApelacion/${apelacionId}`)
    }
    static rechazarApelacion(apelacionId) {
        return axios.post(`/api/Administracion/RechazarApelacion/${apelacionId}`)
    }

    static apelar(banId, descripcion) {
        return axios.post(`/Domado`, { banId, descripcion })
    }

    static eliminarToken(usuarioId) {
        return axios.post(`/api/Moderacion/EliminarToken/${usuarioId}`)
    }

}
