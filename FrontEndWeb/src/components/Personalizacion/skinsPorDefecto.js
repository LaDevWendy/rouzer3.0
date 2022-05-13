export default [{
    nombre: 'Classic',
    style: ``
},
{
    nombre: 'Porche',
    style: `body {
            --color5: orangered;
            --color2: white;
            --color-texto1: black;
            --color-texto2: #808080;
            --color4: orangered;
            --color7: #ffc253ed;
            --color8: #eebd64;
            --color3: #ffdead;
            --color9: #d6d6d6;
            --color1: #ffc83e;
       }
        .media-input {
            background: orangered !important;
       }
        .comentario .id {
            background: black !important;
       }
        .crear-hilo-boton, .categoria, .comentario .tag, comentario, .media-input, .cuerpo, .respuestas-compactas {
            color: white !important;
       }
        .comentario {
            background: #ffffffdb;
       }
        .comentario:hover {
            background: #ffeaeadb !important;
       }
        .menu-principal-header {
            background: #fff;
       }
        .menu-principal, .menu-principal h1, .menu-principal-header {
            color: orangered;
       }
        #fondo-global {
            background-image: url(https://i.ibb.co/dPWZVdY/carpixel-net-2010-porsche-911-gt3-r-hybrid-49401-hd.jpg) !important;
       filter: saturate(0.75);
       }
        .media-input, .menu-principal-header {
            background-image: url(https://i.ibb.co/dPWZVdY/carpixel-net-2010-porsche-911-gt3-r-hybrid-49401-hd.jpg) !important;
            background-size: cover !important;
       }
        textarea {
            border: 2px solid var(--color5);
            background: white !important 
       }
        .cuerpo {
            color:black !important;
       }
        body::-webkit-scrollbar-thumb{
            background-color: var(--color2);
       }
       `
},
{
    nombre: 'Legacy',
    style: `body {
            --color2: #2c3e50;
            --color5: #256587;
        }
        #fondo-global {
            background: #1e2c38;
        }
        
        .comentarios, .side-panel{
            background: #213140 !important;
        }
        .comentario {
            background: #213140
        }
        .sticky-info {
            background: var(--color6) !important;
        }
        
        .comentario:hover {
            background: #2c3b4a !important
        }`
},
{
    nombre: 'Romed',
    style: `body {
            --color1: #800000;
            --color2: #6c1108;
            --color3: #560e06;
            --color4: #a62416;
            --color5: #db9124;
            --color7: #450b05;
            --color8: #560e06;
            --color9: #2a0000;
            --color-texto1: #db9124;
            --color-texto2: #db9124;
       }
        .media-input, .menu-principal-header {
            background: url(https://wallpaperaccess.com/full/308552.jpg) !important;
            background-size: cover !important;
       }
        #crear-hilo-form .media-input {
            background-position-x: -120px !important;
       }
        .menu-principal-header {
            background: url(https://wallpaperaccess.com/full/308552.jpg) !important;
            background-size: cover !important;
       }
        .comentario .id, .favorita {
            background: #6c1108 !important;
       }
        .crear-hilo-boton, .categoria, .comentario .tag, comentario, .media-input, .cuerpo {
            color: white !important;
       }
        .comentario {
            background: #c7c0b1;
            color: black 
       }
        .comentario:hover {
            background: #e3dccc !important;
       }
        .menu-principal-header, .nav-principal {
            background-size: 100%;
            background-position-y: -500px;
       }
        .menu-principal, .menu-principal h1, .menu-principal-header {
            color: #db9124;
       }
        #fondo-global {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: url(https://wallpaperaccess.com/full/308552.jpg);
            background-size: cover;
            background-position-x: -500px;
            z-index: -1;
       }
        textarea {
            border: 2px solid var(--color5);
            background: #c7c0b1 !important;
            color: black 
       }
        .nav-principal h3, .crear-hilo-boton, .cuerpo h1, .version {
            font-family:serif !important;
            text-transform: uppercase !important;
            font-weight: 800;
       }
        .noti-cont {
            color: white 
       }
        .cargar-nuevos-hilos{
            background-color: var(--color2);
       }
        .resaltado .contenido {
            color: white;
       }`
},
{
    nombre: 'Light',
    style: `
body{
    --color1: #fefefe;
    --color2: #fefefe;
    --color3: #f0f0f0;
    --color4: #e5f2f9;
    --color5: #286487;
    --color6: #ffa900;
    --color7: #fef0cb;
    --color8: #fefefe;
    --color9: #fefefe;
    --primary: #286487;
    --color-texto1: black;
    --color-texto2: rgb(0 0 0/ 56%);
    background-color: var(--color2);
}
.rozed, .nav-botones button{
    color: var(--color5) !important;
}
.nav-principal .nav-boton.crear-hilo-boton{
    color: var(--color2);
}
.nav-categorias.visible.oculta .colapsar-categorias{
    background-color: var(--color6);
}
.crear-hilo > div > button, .form-comentario .acciones > button, .actions button{
    background-color: var(--color5) !important;
    color: var(--color2) !important;
}
.noti-cont{
    background-color: #ff0000;
    color: white;
}
.menu-principal ul li:hover, .menu-hilo li:hover, .menu li:hover, .content ul li:hover {
    background: var(--color4);
}
.menu-principal ul li.grupo-categorias-activo{
    background-color: var(--color6);
}
.menu-principal ul li.grupo-categorias:hover, .categoria-link:hover {
    filter: brightness(1) contrast(1);
}
.comentario .header .id.tag, .comentario .header .nick.tag-op{
    background-color: #a2a2a2 !important;
    color: white;
}
.menu-principal ul a:nth-child(6) li svg, .menu-principal ul a:nth-child(7) li svg , .menu-principal ul a:nth-child(8) li svg{
    background: black !important;
    border-radius: 4px !important;
}
.infos > .info.nuevo, .info.special{
    background: #12924b;
}
.cargar-nuevos-hilos{
    background: #25874a;
    color: white;
    border: 2px solid #005800;
    border-radius: 9px !important;
}
.nick.nombre{
    color: #7f7f7f;
    font-weight: bold;
}
.ajustes .overlay .content .panel{
    background: var(--color3) !important;
}
.idunico{
    color: white;
}
.contador-comentarios{
    background: #cae3ef !important;
    color: var(--color5);
}
.crear-hilo > div > button, .dialog > .actions > button {
    margin: 0 4px !important;
}
.contenido >.panel, .contenido > .panel.acciones, .contenido > .panel.acciones-mod{
    background: var(--color4) !important;
}
.denuncia > .header, .denuncia > .body > button, .denuncia > .body > a > button{
    color: white !important;
}
.denuncia > .header > .tiempo{
    color: black !important;
}
.hilo-preview-mod .hilo-in{
    background-color: var(--color5) !important;
}
#fondo-global{
    background-image: url(/imagenes/rosed_light.png);
}
.fondo3, .comentario{
    background: var(--color2);
}
.menu-principal-header{
    background: url(/imagenes/rose2_light.jpg);
    background-position-y: -80px;
    background-size: cover;
}
.video-preview, .media-input{
    background: url(/imagenes/rose2_light.jpg) !important;
    background-size: cover !important;
    background-position: center !important;
}
input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px var(--color5) inset !important;
    border-radius: 4px;
}
.hilo .menu-position button:nth-child(1){
    color: rgb(255 255 255/56%) !important;
}
.verde {
    color: #12924b;
}
    `
},
{
    nombre: 'Skin de usuario 1',
    style: ``
},
{
    nombre: 'Skin de usuario 2',
    style: ``
},
{
    nombre: 'Skin de usuario 3',
    style: ``
},
{
    nombre: 'Skin de usuario 4',
    style: ``
},
{
    nombre: 'Skin de usuario 5',
    style: ``
}
]