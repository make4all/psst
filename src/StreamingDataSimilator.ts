import { Stream } from "stream";
export class SampleDataGenerator{
    private numberOfValuesGenerated:number = 0;
    
    interval    : number = 0;
    // private interval:number = 0 ;
    // private var interval;
     
        start(controller:any){
             this.interval=window.setInterval(() => {
                
                console.log("generated number of points:",this.numberOfValuesGenerated);
                let dataPoint = Math.random();
                console.log("generated datapoint",dataPoint)
                controller.enqueue(dataPoint.toString())
                console.log("pushed");
                this.numberOfValuesGenerated = this.numberOfValuesGenerated + 1;
                },300);
    setTimeout(() =>{
        clearInterval(this.interval);
        controller.close();
    }, 3_000);          
            }
    
    
            
        
    
}
