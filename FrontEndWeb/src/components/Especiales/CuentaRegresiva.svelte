<script>


let dias = 0
let horas = 0 
let minutos = 0
let segundos = 0

let countDown = () => {
    let futureDate = new Date("1 Jan 2021");
    let currentDate = new Date();
    
    let myDate = futureDate - currentDate;
    
    dias = Math.floor(myDate / 1000 / 60 / 60 / 24);
    
    horas = Math.floor(myDate / 1000 / 60 / 60 ) % 24;
    
    minutos = Math.floor(myDate / 1000 / 60  ) % 60;
    
    segundos = Math.floor(myDate / 1000 ) % 60;

}

countDown()

setInterval(countDown, 1000)
</script>

<div class="cuenta-regresiva">
    <span>Se viene en</span>
    <div class="countdown-container">
        <span id="hours" class="big-text">{horas}</span>
        <span>Horas</span>
        <span id="min" class="big-text">{minutos}</span>
        <span>Minutos</span>
        <span id="sec" class="big-text">{segundos}</span>
        <span>Segundos</span>
    </div>
</div>

<style>
    .cuenta-regresiva {
        font-family: 'euroFighter';
        font-size: 13px;
        color: #cc1d1d;
        text-align: center;
        position: absolute;
        padding-top: 4px;
        width: 100%;
        pointer-events: none !important;
    }

    @media (max-width: 600px) {
        .cuenta-regresiva {
            font-size: 4px;
        }
    }

</style>

