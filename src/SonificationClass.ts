import * as d3 from 'd3';

export class Sonifier { // still need to finish making this a proper singleton. need to create an interface and export an instance of the sonifier. Any advice on making this a singleton the right way?
    private static sonifierInstance: Sonifier;
    protected audioCtx: AudioContext;
    protected audioCTXBaseTime:number;
    private constructor() {
        this.audioCtx = new AudioContext(); // works without needing additional libraries. need to check this when we move away from react as it is currently pulling from react-dom.d.ts.
        let startTime = this.audioCtx.currentTime;
        
        this.audioCTXBaseTime = startTime;
    }
    public static getSonifierInstance(): Sonifier {
        if(!this.sonifierInstance)       
        this.sonifierInstance = new Sonifier();
        return this.sonifierInstance;
    }
    
    public playSimpleTone(this: Sonifier, dummyData:number[]): void{
        console.log("playTone: sonifying data", dummyData);
        

        
        let pointSonificationLength:number = 0.3;
        var previousFrequencyOfset: number = 50;
        var startTime: number = this.audioCtx.currentTime;

        let frequencyExtent = [16, 1e3];
        let dataExtent = d3.extent(dummyData);

        // -10 to 10

        let frequencyScale = d3.scaleLinear().domain(dataExtent).range(frequencyExtent);
        for (let i = 0; i < dummyData.length; i++)
          {
            
            var frequencyOffset = frequencyScale(dummyData[i]);
            // frequencyOfset = frequencyOfset%1000;
            
            console.log("frequency offset", frequencyOffset);
            var osc = this.audioCtx.createOscillator();
            osc.frequency.value = previousFrequencyOfset;
            var endTime = startTime + pointSonificationLength;
            // console.log("start time ",startTime);
            // const wave = audioCtx.createPeriodicWave(wavetable.real, wavetable.imag); //keeping this line for future reference if we wish to use custom wavetables.
            // osc.setPeriodicWave(wave);
            osc.frequency.linearRampToValueAtTime(frequencyOffset,startTime+pointSonificationLength);
            // console.log(osc.frequency.value);
            // console.log(audioCtx.currentTime);
            osc.connect(this.audioCtx.destination);
            osc.start(startTime)
            // console.log("started");
            osc.stop(endTime);
            // console.log("stopping");
            // console.log(audioCtx.currentTime);
            startTime = endTime;
            previousFrequencyOfset = frequencyOffset;
    
          }
    
    }

    public playHighlightPointsWithNoise(this: Sonifier, dummyData:number[], highlightPoint:number): void{
        let pointSonificationLength:number = 0.3;
        var previousFrequencyOfset: number = 50;
        var startTime: number = this.audioCtx.currentTime;
        for (let i = 0; i < dummyData.length; i++)
          {
            
            var frequencyOfset = 2* dummyData[i];
            // frequencyOfset = frequencyOfset%1000;
            
            console.log("frequency ofset", frequencyOfset);
            var osc = this.audioCtx.createOscillator();
            osc.frequency.value = previousFrequencyOfset;
            let noiseNode = this.createNoiseBufferNode(pointSonificationLength);

            let bandPassFilterNode = this.createBandPassFilterNode();
            var endTime = startTime + pointSonificationLength;
            osc.frequency.linearRampToValueAtTime(frequencyOfset,startTime+pointSonificationLength);
            osc.connect(this.audioCtx.destination);
            osc.start(startTime);
            osc.stop(endTime);
            if(dummyData[i] == highlightPoint)
            {
                noiseNode.connect(bandPassFilterNode).connect(this.audioCtx.destination);
                noiseNode.start(startTime)
                noiseNode.stop(endTime)
            }
            startTime = endTime;
            previousFrequencyOfset = frequencyOfset;
    
          }
    
   

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
                let noiseNode = this.createNoiseBufferNode(pointSonificationLength);
                let bandPassFilterNode = this.createBandPassFilterNode();                
                noiseNode.connect(bandPassFilterNode).connect(this.audioCtx.destination);
                noiseNode.start(startTime)
                noiseNode.stop(endTime)
            }
            startTime = endTime;
            previousFrequencyOfset = frequencyOfset;            
        }
    }
    
    private createNoiseBufferNode(pointSonificationLength: number): AudioBufferSourceNode {
        const noiseBufferSize: number = this.audioCtx.sampleRate * pointSonificationLength;
        const buffer = this.audioCtx.createBuffer(1, noiseBufferSize, this.audioCtx.sampleRate);
        let bufferData = buffer.getChannelData(0);
        for (let i = 0; i < noiseBufferSize; i++) {
            bufferData[i] = Math.random() * 2 - 1;
        }
        let noiseNode = this.audioCtx.createBufferSource();
        noiseNode.buffer = buffer;
        return noiseNode;
    }
}