<script>
    let luces = [];

    for (let i = 0; i < 50; i++) {
        luces.push({ color: colorRandom(), opacity: Math.random() });
    }
    luces = luces;

    /*setInterval(() => {
        luces = luces.map((l) => {
            if (Math.random() < 0.1) {
                l.opacity = Math.random();
            }
            return l;
        });
        luces = luces;
    }, 200);*/

    console.log(luces);
    function colorRandom() {
        let colores = ["221,50,38", "83,165,56", "255,196,0", "0,64,138"];
        return colores[Math.floor(Math.random() * colores.length)];
    }
</script>

<div class="lucesitas">
    {#each luces as luz}
        <div
            class="luz"
            style={`transform:translateX(${0}px) translateY(${0}px);
            background: radial-gradient(circle, rgba(${luz.color},1) 0%,rgba(${
                luz.color
            },0.9) 15%, rgba(${luz.color},0.5) 20%, rgba(${
                luz.color
            }, 0) 50%) !important;
            opacity: ${luz.opacity}
            `}
        />
    {/each}
</div>

<style>
    .lucesitas {
        display: flex;
        justify-content: space-between;
        position: absolute;
        width: 100%;
    }

    .luz {
        height: 20px;
        width: 20px;
        /* background:white;
        box-shadow: aliceblue 0 0 20px; */
        background: radial-gradient(
            circle,
            rgba(255, 253, 65, 1) 0%,
            rgba(255, 253, 65, 0.9) 15%,
            rgba(255, 253, 65, 0.5) 20%,
            rgba(9, 9, 121, 0) 50%
        );
        transition: 1s;
    }
</style>
