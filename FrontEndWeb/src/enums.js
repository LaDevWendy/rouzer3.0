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

export class CreacionRango {
    static Anon = 0
    static Auxiliar = 1
    static Mod = 2
    static Admin = 3
    static Dev = 4

    static aString(rango) {
        let keys = Object.keys(CreacionRango)
        let string = ""
        keys.forEach(k => {
            if (CreacionRango[k] == rango) string = k;
        });
        return string
    }
}
export class TipoAccion {
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

    static aString(rango) {
        let keys = Object.keys(TipoAccion)
        let string = ""
        keys.forEach(k => {
            if (TipoAccion[k] == rango) string = k;
        });
        return string
    }
}

export class ApelacionEstado {
    static Pendiente = 0
    static Aceptada = 1
    static Rechazada = 2

    static aString(rango) {
        let keys = Object.keys(ApelacionEstado)
        let string = ""
        keys.forEach(k => {
            if (ApelacionEstado[k] == rango) string = k;
        });
        return string
    }
}

export class Flag {
    static Banderitas = 0
    static Concentracion = 1
    static Dados = 2
    static IdUnico = 3
    static Maximo = 4
    static Serio = 5
    static Spoiler = 6
}