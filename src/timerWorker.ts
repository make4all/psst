export{}
let timer:number | null = null;
let interval:number;
self.onmessage = function(event) {
    if(event.data == "start") {
        timer=window.setInterval(function(){postMessage("tick");},interval)
    } else if(event.data.interval)
    {
        interval = event.data.interval;
        if(timer)
        {
            window.clearInterval(timer)
            timer=window.setInterval(function(){postMessage("tick");},interval)
        }
    } if(event.data == "stop" ) {
        window.clearInterval(timer);
    }
}