class Enum {
    static aString(rango) {
        let keys = Object.keys(this)
        let string = ""
        keys.forEach(k => {
            if (this[k] == rango) string = k;
        });
        return string
    }
}

class EnumWithFields {
    static getField(id) {
        let keys = Object.keys(this)
        let field = null;
        keys.forEach(k => {
            if (this[k].id == id) field = this[k];
        });
        return field
    }
}

export class HiloEstado {
    static normal = 0
    static archivado = 1
    static eliminado = 2
}
export class ComentarioEstado {
    static normal = 0
    static eliminado = 1
}

export class MotivoDenuncia extends Enum {
    static CategoriaIncorrecta = 0
    static Spam = 1
    static Doxxeo = 2
    static ContenidoIlegal = 3
    static Gore = 4
    static MaltratoAnimal = 5
}

export class EstadoDenuncia {
    static Aceptada = 0
    static Rechazada = 1
    static NoRevisada = 2
}

export class CreacionRango extends Enum {
    static Anon = 0
    static Auxiliar = 1
    static Mod = 2
    static Admin = 3
    static Dev = 4
    static Bot = 5
}
export class TipoAccion extends Enum {
    static ComentarioBorrado = 0
    static HiloBorrado = 1
    static CategoriaCambiada = 2
    static DenunciaRechazada = 3
    static UsuarioBaneado = 4
    static UsuarioDesbaneado = 5
    static ComentarioRestaurado = 6
    static HiloRestaurado = 7
    static HiloStickeado = 8
    static HiloDeestickeado = 9
    static MediaEliminado = 10
    static AudioEliminado = 11
}

export class ApelacionEstado extends Enum {
    static Pendiente = 0
    static Aceptada = 1
    static Rechazada = 2
}

export class Flag extends Enum {
    static Banderitas = 0
    static Concentracion = 1
    static Dados = 2
    static IdUnico = 3
    static Maximo = 4
    static Serio = 5
    static Spoiler = 6
}

export class TipoCP extends Enum {
    static ActivacionPremium = 0
    static RouzCoins = 1
}

export class TipoTransaccion extends Enum {
    static Compra = 0
    static Reembolso = 1
    static MensajeGlobal = 2
    static AutoBump = 3
    static HacerDonacion = 4
    static RecibirDonacion = 5
    static Juego = 6
}

export class TipoAccionCP extends Enum {
    static Creacion = 0
    static Uso = 1
}
export class EstadoPedido extends EnumWithFields {
    static Pendiente = { id: 0, nombre: "Pendiente" }
    static RechazadoPorUsuario = { id: 1, nombre: "Rechazado por el usuario" }
    static Rechazado = { id: 2, nombre: "Rechazado" }
    static Aceptado = { id: 3, nombre: "Aceptado" }
}