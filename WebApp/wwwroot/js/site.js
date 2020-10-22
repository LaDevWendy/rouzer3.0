// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your Javascript code.
//Copy and paste
function getFormData($form) {
    var unindexed_array = $form.serializeArray;
    var indexed_array = {};

    $.map(unindexed_array, function (n, i) {
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}


class RChanApi {
    static crearHilo(hiloData) {
        return axios.post("/api/Hilo/Crear", hiloData)
    }
}

class RChanClient {


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
    static agregar(accion, id) {
        return axios.post('/api/Hilo/Agregar', {
            accion,
            hiloId: id
        })
    }
}

// VISTA

class Hilo {
    static getId() {
        return document.querySelector(".hilo-completo").getAttribute("r-id")
    }
}

class ComentarioMenu {
    static menuComentario = null;

    static mostrarMenu(e) {
        this.menuComentario.style.visibility = "visible"
        e.target.parentElement.parentElement
            .appendChild(this.menuComentario);

        this.menuComentario.children[0].addEventListener("click", this.ocultarComentario)
        this.menuComentario.children[1].addEventListener("click", this.reportar)
    }

    static ocultarMenu = () => this.menuComentario.style.visibility = "hidden";

    static inicializar() {
        this.menuComentario = document.getElementById("opciones-comentario")
        if (this.menuComentario == null) return;
        this.menuComentario.addEventListener("mouseleave", this.ocultarMenu)
    }

    static reportar() {
        ComentarioMenu.ocultarMenu();
    }

    static ocultarComentario() {
        $(ComentarioMenu.menuComentario.closest(".comentario").querySelector(".contenido")).toggle();
    }
}

ComentarioMenu.inicializar();

class FormComentario {
    input = document.getElementById('comentario-input')
    form = document.getElementById('form-comentario')
    contenido = this.form.querySelector("textarea")
    btn = this.form.querySelector(".btn")

    seleccionarArchivo(e) {
        e.preventDefault()
        this.input.click()
    }

    inicializar() {
        document
            .querySelectorAll(".comentario .header .id")
            .forEach(e => e.addEventListener("click", e => this.taggear(e.target.textContent)))

    }

    actualizarArchivo(input) {

        if (input.files && input.files[0]) {
            this.btn.style.color = "orange"
            var reader = new FileReader()
            reader.onload = function (e) {
                $('#blah')
                    .attr('src', e.target.result)
                    .width(150)
                    .height(200);
            };

            reader.readAsDataURL(input.files[0])
        }
    }

    async crear(e) {
        e.preventDefault()

        let archivo = this.input.files[0]
        var r = await RChanClient.crearComentario(Hilo.getId(), this.contenido.value, archivo)
        console.log(r);
        this.contenido.value = ""
        this.input.files = null
        this.input.value = ""
    }

    taggear(id) {
        if (this.contenido.value.includes(`>>${id}`)) return;
        this.contenido.value += `>>${id}\n`
    }
}

class ComentarioFlotante {
    static clonComentario = null
    static comentario = null
    static tag = null

    static inicializar() {
        $(".comentario .restag")
            .on("mouseover", e => {
                if (this.clonComentario != null) return

                this.tag = e.target

                this.comentario = document.getElementById(this.tag.getAttribute("r-id").replace(" ", ""))
                if (this.comentario == null) return;

                this.clonComentario = this.comentario.cloneNode(true)
                this.clonComentario.classList.add("comentario-flotante")
                this.tag.closest(".comentario").appendChild(this.clonComentario)
            })
        $(".comentario .restag").on("mouseleave", e => {
            if (this.clonComentario == null) return;
            this.tag.closest(".comentario").removeChild(this.clonComentario)
            this.clonComentario = null
        })
    }
}

class FormHilo {
    static form = document.getElementById("crear-hilo-form")
    static fileInput = this.form.querySelector("input[type=file]")
    static mostrar() {
        if (!tieneSesion) FormSesion.abrir();
        else this.form.parentNode.style.visibility = "visible";
    }
    static ocultar() {
        this.form.parentNode.style.visibility = "hidden";
    }

    static inicializar() {
        this.form.addEventListener("click", e => e.stopPropagation())
        this.form.parentNode.addEventListener("click", e => this.ocultar())
    }

    static seleccionarArchivo() {
        this.fileInput.click();
    }
    static imagenSeleccionada(event) {
        console.log("ImagenSeleccionada");
        let fr = new FileReader()
        fr.onload = e => $(".video-preview ").css('background-image', 'url("' + fr.result + '")')
        fr.readAsDataURL(this.fileInput.files[0])

        $('[data-valmsg-for=Archivo]')[0].textContent = ""
    }

    static async crearHilo(e) {
        e.preventDefault()

        $(".errores-extra").html(" ")

        let archivo = this.fileInput.files[0]
        let titulo = this.form.querySelector('[name=Titulo]').value
        let categoria = this.form.querySelector('[name=CategoriaId]').value - 0
        let contenido = this.form.querySelector('[name=Contenido]').value

        if (!archivo) {
            $('[data-valmsg-for=Archivo]')[0].textContent = "Elegi una imagen! Enfermo!"
            return;
        }
        if (!$(this.form).valid()) return;

        let form = new FormData()
        form.append("Titulo", titulo)
        form.append("CategoriaId", categoria)
        form.append("Contenido", contenido)
        form.append("Archivo", archivo)

        try {
            let respuesta = await RChanApi.crearHilo(form);
            if (respuesta.status == 201) {
                window.location.replace(respuesta.headers.location)
            }
        } catch (err) {
            let res = err.response
            for (let key of Object.keys(res.data)) {
                $(`<li>${key}: ${res.data[key].join(" ")}</li>`).appendTo(".errores-extra")
            }
        }


        // var r = await RChanClient.crearComentario(Hilo.getId(), this.contenido.value, archivo)

        // RChanApi
        //     .crearHilo(hiloDataJson)
        //     .then(console.log)
        //     .catch(err => {
        //         console.log(err.response);
        //         console.log(err.response.data);
        //         let json = err.response.data;
        //         for (const e of Object.keys(json.errors)) {
        //             $(`.data-valmsg-for='${e}'`).text(json.errors[e])
        //             console.log(`${e} ${json.errors[e]}`);
        //         }
        // })
    }
}

// FormHilo.inicializar();
ComentarioFlotante.inicializar();

class Nav {
    static inicializar() {
        $(".drop-btn")
            .on("click", e => {
                e.currentTarget.querySelector(".drop-menu").style.visibility = "visible"
            })
        $(".drop-menu")
            .on("mouseleave", e => {
                e.currentTarget.style.visibility = "hidden"
            })
    }
}

class FormSesion {
    static form = document.getElementById("crear-sesion")
    static abrir() {
        this.form.closest(".sombra").style.visibility = "visible"
    }

    static registrarse() {
        const nick = this.form.querySelector("[name=Nick]").value
        const contraseña = this.form.querySelector("[name=Contraseña]").value

        if (!$(this.form).valid()) return;

        try {
            const res = RChanClient.registrase(nick, contraseña);
            console.log(res);
        } catch (error) {
            console.log(error);
        }
    }
}
Nav.inicializar()


class Acciones {
    static inicializar() {
        $("[r-accion]").on("click", async e => {
            const boton = e.currentTarget;
            const tipoAccion = boton.getAttribute("r-accion")
            const hiloId = boton.getAttribute("r-id")

            const {
                data
            } = await RChanClient.agregar(tipoAccion, hiloId)
            const activo = data.mensaje.includes("añadido")


            if (activo) {
                $(boton).addClass("naranja")
                $(boton).removeClass("fantasma")
            } else {
                $(boton).addClass("fantasma")
                $(boton).removeClass("naranja")
            }

        })
    }
}
Acciones.inicializar()

class Respuestas {
    static inicializar() {
        let dic = {}

        document.querySelectorAll(".comentario")
            .forEach(c => {
                let tags = c.querySelector(".texto").textContent.match(/>>([A-Z0-9]{8})/g)
                if(!tags) return;
                let id = c.getAttribute("r-id")
                for(const tag of tags) {
                    let otraId = tag.slice(2, 10)
                    if(!dic[otraId]) dic[otraId] = []
                    dic[otraId].push(id)
                }
            })
            
        for(const key of Object.keys(dic)) {
            let html = dic[key].map(id => `<a href="#${id}" class="restag" r-id="${id}">>>${id}</a>`).join(" ")
            if(!document.getElementById(key)) continue;
            document.getElementById(key).querySelector(".respuestas").innerHTML = html
        }
        ComentarioFlotante.inicializar();

                
    }
}

Respuestas.inicializar()

class HubHome {
    static connection = new signalR.HubConnectionBuilder().withUrl("/hub").build();
    static hilos = []
    static inicializar() {
        this.connection.on("HiloCreado", this.onHiloCreado)
        this.connection.start().then(() => {
            console.log("Conectado");
            return this.connection.invoke("SubscribirAHome")
            
        }).catch(console.error)
    }

    static onHiloCreado(hilo) {
        console.log("Hilo Creado")
        let listaHilos = document.querySelector(".hilo-list")
        listaHilos.insertBefore(HubHome.hiloADOM(hilo), listaHilos.childNodes[0]);
        console.log("Hilo insertado")
    }

    static hiloADOM(hilo) {
        console.log(hilo);
        
        var dp = new DOMParser()
        return dp.parseFromString( `
        <li class="hilo">
            <a class="hilo-in" href="/Hilo/${hilo.id}">
                <img src="${hilo.media.vistaPreviaCuadrado}" alt="${hilo.titulo}" class="imghilo">
                <div class="infos">
                    <div class="info" style="color:">${["","ART","TEC","UFF"][hilo.categoriaId]}</div>
                    <div class="info" style="background:#18222D">Nuevo</div>
                </div>

                <div class="infos info-hover">
                    <div class="info">0</div>

                    <div class="acciones">
                        <span class="fe fe-eye-off"></span>
                        <span class="fe fe-flag"></span>
                    </div>
                </div>

                <h3>${hilo.titulo}</h3>
            </a>
        </li>`, 'text/html').body.children[0]
    }
}

HubHome.inicializar();

function htmlADom(html) {
    return (new DOMParser()).parseFromString(html,'text/html').body.children[0]
}

class HubHilo {
    static connection = new signalR.HubConnectionBuilder().withUrl("/hub").build();
    static cargarNuevos = document.getElementById("cargar-nuevos")
    static comentarios = []
    static hiloId
    static inicializar(hiloId) {
        HubHilo.hiloId = hiloId
        HubHilo.connection.on("NuevoComentario", HubHilo.onComentarioCreado)
        HubHilo.connection.start().then(() => {
            console.log("Conectado");
            return HubHilo.connection.invoke("SubscribirseAHilo", hiloId)
            
        }).catch(console.error)
    }

    static onComentarioCreado(comentario) {
        console.log("Comentario Creado")
        HubHilo.comentarios.push(htmlADom(comentario))
        HubHilo.cargarNuevos.style.visibility = "visible"
        HubHilo.cargarNuevos.innerHTML = `+ ${HubHilo.comentarios.length} nuevos`
        console.log(comentario)
        $("#jijo").click()
    }

    static cargarNuevosComentarios() {
        $(".lista-comentarios").prepend(...HubHilo.comentarios.reverse());
        let contador = document.querySelector(".contador-comentarios h3")

        let cantidadAnterior = contador.innerHTML.match(/\d+/)[0]
        contador.innerHTML = contador.innerHTML.replace(cantidadAnterior, Number(cantidadAnterior) + HubHilo.comentarios.length)
        HubHilo.comentarios = []
        
        
        Respuestas.inicializar();
        ComentarioFlotante.inicializar();
        HubHilo.cargarNuevos.style.visibility = "hidden"
 
    }
    static data() {
        return {
            noCargados: HubHilo.comentarios
        }
    }
}


HubHome.inicializar();