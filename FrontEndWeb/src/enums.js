export class HiloEstado {
    static normal = 0
    static archivado = 1
    static eliminado = 2
}
export class ComentarioEstado {
    static normal = 0
    static eliminado = 1
}

export class MotivoDenuncia
{
    static CategoriaIncorrecta = 0
    static Spam = 1
    static Doxxeo = 2
    static CoentenidoIlegal = 3
    static Gore = 4
    static MaltratoAnimal = 5
}

export class EstadoDenuncia
{
    static Aceptada = 0
    static Rechazada = 1
    static NoRevisada = 2
}

export class CreacionRango 
{
    static Anon = 0
    static Janitor = 1
    static Mod = 2
    static Admin = 3

    static aString(rango) 
    {
        let keys = Object.keys(CreacionRango)
        let string = ""
        keys.forEach(k => {
            if(CreacionRango[k] == rango) string = k;
        });
        return  string
    }
}
