import {HubConnectionBuilder} from '@microsoft/signalr'

// const coneccion = new HubConnectionBuilder().withUrl("/hub").build()

// let colaDeSubscripciones = []



// function subscribirseAHilo(hiloid) {
//     colaDeSubscripciones.push(() => coneccion.invoke("SubscribirseAHilo", hiloid))
// }
class Signal {
    static coneccion = new HubConnectionBuilder().withUrl("/hub").build()
    static colaDeSubscripciones = []

    static subscribirseAHilo(hiloid) {
        this.colaDeSubscripciones.push(() => this.coneccion.invoke("SubscribirseAHilo", hiloid))
    }
    static subscribirAHome() {
        this.colaDeSubscripciones.push(() => this.coneccion.invoke("SubscribirAHome"))
    }
}
Signal.coneccion.start().then(() => {
    console.log("ConectandoSignal");
    Signal.colaDeSubscripciones.forEach(s => {
        s()
    })
    
}).catch(console.error)

export default  Signal
