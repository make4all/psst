export{}
let timer:number;
let interval:number;
self.onmessage = (event) => {
    if(event.data == "start") {
        timer=window.setInterval(() => postMessage("tick"),interval)
    } else if(event.data.interval)
    {
        interval = event.data.interval;
        if(timer)
        {
            window.clearInterval(timer)
            timer=window.setInterval(() => postMessage("tick"),interval)
        }
    } else  if(event.data == "stop" ) {
        window.clearInterval(timer);
    } else {
        window.clearInterval(timer);
    }
}