function relativeTime(date) {

    let  current = new Date().getTime()
    let  previous = date.getTime()
    const  msPerMinute = 60 * 1000;
    const  msPerHour = msPerMinute * 60;
    const  msPerDay = msPerHour * 24;
    const  msPerMonth = msPerDay * 30;
    const  msPerYear = msPerDay * 365;

    let  elapsed = current - previous;

    if (elapsed < msPerMinute) {
            return Math.round(elapsed/1000) + ' s';   
    }

    else if (elapsed < msPerHour) {
            return Math.round(elapsed/msPerMinute) + ' m';   
    }

    else if (elapsed < msPerDay ) {
            return Math.round(elapsed/msPerHour ) + ' h';   
    }

    else if (elapsed < msPerMonth) {
        return  Math.round(elapsed/msPerDay) + ' d';   
    }

    else if (elapsed < msPerYear) {
        return  Math.round(elapsed/msPerMonth) + ' Mes';   
    }

    else {
        return  Math.round(elapsed/msPerYear ) + ' a';   
    }

}