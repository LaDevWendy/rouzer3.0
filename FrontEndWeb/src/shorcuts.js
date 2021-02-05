
let teclas = {
    estaPresionada(tecla) {
        console.log(tecla);
        console.log(teclas[tecla]);
        return teclas[tecla]
    }
}
document.addEventListener('keydown', function(e){
    teclas[e.key] = true;
})
document.addEventListener('keyup', function(e){
    teclas[e.key] = false;
 })

 export default teclas