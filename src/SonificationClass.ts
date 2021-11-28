import * as stream from 'stream';
import { SonificationLevel } from './constents';
import { SampleDataGenerator } from './StreamingDataSimilator';
export class Sonifier  { // still need to finish making this a proper singleton. need to create an interface and export an instance of the sonifier. Any advice on making this a singleton the right way?
    private static sonifierInstance: Sonifier;
    protected audioCtx: AudioContext;
    protected startTime:number;
    protected endTime: number;
    protected isStreamInProgress:boolean;
    protected previousFrequencyOfset: number;
    protected pointSonificationLength:number;
    private constructor() {
        // super()
        this.audioCtx = new AudioContext(); // works without needing additional libraries. need to check this when we move away from react as it is currently pulling from react-dom.d.ts.
        this.startTime = this.audioCtx.currentTime;
        this.endTime = this.startTime;
        
        
        this.isStreamInProgress = false;
        this.previousFrequencyOfset = 50;
        this.pointSonificationLength = 0.3;
    }
    public static getSonifierInstance(): Sonifier {
        if(!this.sonifierInstance)       
        this.sonifierInstance = new Sonifier();
        return this.sonifierInstance;
    }
    
    public playSimpleTone(this: Sonifier, dummyData:number[]): void{
        console.log("playTone: sonifying data", dummyData)
        this.previousFrequencyOfset = 50;
        

        
        
        
        this.startTime = this.audioCtx.currentTime;
        for (let i = 0; i < dummyData.length; i++)
          {
            
            var frequencyOfset = 2* dummyData[i];
            // frequencyOfset = frequencyOfset%1000;
            
            console.log("frequency ofset", frequencyOfset);
            var osc = this.audioCtx.createOscillator();
            osc.frequency.value = this.previousFrequencyOfset;
            this.endTime = this.startTime + this.pointSonificationLength;
            // console.log("start time ",startTime);
            // const wave = audioCtx.createPeriodicWave(wavetable.real, wavetable.imag); //keeping this line for future reference if we wish to use custom wavetables.
            // osc.setPeriodicWave(wave);
            osc.frequency.linearRampToValueAtTime(frequencyOfset,this.startTime+this.pointSonificationLength);
            // console.log(osc.frequency.value);
            // console.log(audioCtx.currentTime);
            osc.connect(this.audioCtx.destination);
            osc.start(this.startTime)
            // console.log("started");
            osc.stop(this.endTime);
            // console.log("stopping");
            // console.log(audioCtx.currentTime);
            this.startTime = this.endTime;
            this.previousFrequencyOfset = frequencyOfset;
    
          }
    
    }

    public playHighlightPointsWithNoise(this: Sonifier, dummyData:number[], highlightPoint:number): void{
        this.previousFrequencyOfset= 50;
        this.startTime = this.audioCtx.currentTime;
        for (let i = 0; i < dummyData.length; i++)
          {
            
            var frequencyOfset = 2* dummyData[i];
            // frequencyOfset = frequencyOfset%1000;
            
            console.log("frequency ofset", frequencyOfset);
            var osc = this.audioCtx.createOscillator();
            osc.frequency.value = this.previousFrequencyOfset;
            let noiseNode = this.createNoiseBufferNode();

            let bandPassFilterNode = this.createBandPassFilterNode();
             this.endTime = this.startTime + this.pointSonificationLength;
            osc.frequency.linearRampToValueAtTime(frequencyOfset,this.startTime+this.pointSonificationLength);
            osc.connect(this.audioCtx.destination);
            osc.start(this.startTime);
            osc.stop(this.endTime);
            if(dummyData[i] == highlightPoint)
            {
                noiseNode.connect(bandPassFilterNode).connect(this.audioCtx.destination);
                noiseNode.start(this.startTime)
                noiseNode.stop(this.endTime)
            }
            this.startTime = this.endTime;
            this.previousFrequencyOfset = frequencyOfset;
    
          }
    
   

}

// public sonifyReaderStream(readableDataStream: ReadableStream<any>) {
//     const reader = readableDataStream.getReader();
//     reader.read().then(function playDataPoint({done,value}): any{
//         if(done)
//         {
//             console.log("stream complete");
//             return;
//     }
//     console.log("received value",value);
//     return reader.read().then(playDataPoint);
//     })
// }
public sonifyReaderStream()
{
    const dataStream = new ReadableStream(new SampleDataGenerator());
    const reader = dataStream.getReader();
    var localSonifier = this;
        reader.read().then(function playDataPoint({done,value}): any{
            if(done)
            {
                localSonifier.previousFrequencyOfset = 50;    
                console.log("stream complete");
                    // localSonifier.isStreamInProgress = false;
                    return;
        }
        localSonifier.isStreamInProgress = true;
        // console.log("received value",value);
        localSonifier.sonifyPoint(parseFloat(value)*10000)
        return reader.read().then(playDataPoint);
        })
}
    sonifyPoint(dataPoint: number) {
        console.log("in sonify point. datapoint:",dataPoint);
        let pointSonificationLength:number = 0.3;
        
        console.log("isStreamInProgress",this.isStreamInProgress)
        if (!this.isStreamInProgress)
        {
            this.previousFrequencyOfset = 50;
            this.isStreamInProgress = true
        }
        var startTime: number = this.audioCtx.currentTime;   
        var osc = this.audioCtx.createOscillator();
                osc.frequency.value = this.previousFrequencyOfset;
                
        
        var endTime = startTime + pointSonificationLength;
        osc.frequency.linearRampToValueAtTime(dataPoint,startTime+pointSonificationLength);
        // console.log("start time to sonify datapoint",startTime)
        // console.log("end time for sonification",endTime)
        osc.connect(this.audioCtx.destination)
        osc.start(startTime);
        osc.stop(endTime);
        this.previousFrequencyOfset = dataPoint;
    }
    private createBandPassFilterNode() {
        let bandPassFilterNode = this.audioCtx.createBiquadFilter();
        bandPassFilterNode.type = 'bandpass';
        bandPassFilterNode.frequency.value = 440;
        return bandPassFilterNode;
    }

    public playHighlightedRegionWithTones(this: Sonifier, dummyData:number[], beginRegion:number,endRegion:number): void{
        if(beginRegion > endRegion)
        [beginRegion, endRegion] = [endRegion, beginRegion];
        let pointSonificationLength:number = 0.3;
        var previousFrequencyOfset: number = beginRegion;
        var startTime: number = this.audioCtx.currentTime;
        for (let i = 0; i < dummyData.length; i++)
        {
            var frequencyOfset = 2* dummyData[i];
            var endTime = startTime + pointSonificationLength;
            
            if(dummyData[i] >= beginRegion && dummyData[i] <= endRegion)
            {
                var osc = this.audioCtx.createOscillator();
                osc.frequency.value = previousFrequencyOfset;
                osc.frequency.linearRampToValueAtTime(frequencyOfset,startTime+pointSonificationLength);
                osc.connect(this.audioCtx.destination);
                osc.start(startTime);
                osc.stop(endTime);

            
            } else {
                let noiseNode = this.createNoiseBufferNode();
                let bandPassFilterNode = this.createBandPassFilterNode();                
                noiseNode.connect(bandPassFilterNode).connect(this.audioCtx.destination);
                noiseNode.start(startTime)
                noiseNode.stop(endTime)
            }
            startTime = endTime;
            previousFrequencyOfset = frequencyOfset;            
        }
    }
    
    private createNoiseBufferNode(): AudioBufferSourceNode {
        const noiseBufferSize: number = this.audioCtx.sampleRate * this.pointSonificationLength;
        const buffer = this.audioCtx.createBuffer(1, noiseBufferSize, this.audioCtx.sampleRate);
        let bufferData = buffer.getChannelData(0);
        for (let i = 0; i < noiseBufferSize; i++) {
            bufferData[i] = Math.random() * 2 - 1;
        }
        let noiseNode = this.audioCtx.createBufferSource();
        noiseNode.buffer = buffer;
        return noiseNode;
    }

    public SonifyPushedPoint(dataPoint:number, level:SonificationLevel){
        if(level == SonificationLevel.rude)
        throw console.error ("not implemented.");
        this.playDatapoint(dataPoint);
        
    }
    private playDatapoint(dataPoint: number) {
       
    }



}