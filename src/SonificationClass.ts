
import * as d3 from 'd3';

import { AudioQueue } from './sonificationUtils';
//move enums to constants.ts . Currently seeing runtime JS error saying that the enum is not exported from constants.ts so placing them here to move forward with building. 
export enum SonificationLevel // similating aria-live ="polite","rude", etc. for sonification
    {
        polite, //does not interrupt previously sonifying data.
        rude // cancels all current sonifications and plays the current point
    }
    enum SonificationType{
        Tone, // plays tone
        Noise, // plays noise
        NoiseHighlight // plays both tone and noise for a point
    }
export class Sonifier  { // This is a singleton. need to create an interface and export an instance of the sonifier. Any advice on making this a singleton the right way?
    private static sonifierInstance: Sonifier;
    protected audioCtx: AudioContext;
    protected startTime:number;
    protected endTime: number;
    protected isStreamInProgress:boolean;
    protected previousFrequencyOfset: number;
    protected pointSonificationLength:number;
    protected audioQueue:AudioQueue;
    protected priority: SonificationLevel;
    private constructor() {
        // super()
        this.audioCtx = new AudioContext(); // works without needing additional libraries. need to check this when we move away from react as it is currently pulling from react-dom.d.ts.
        this.startTime = this.audioCtx.currentTime;
        this.endTime = this.startTime;
        this.audioQueue = new AudioQueue();
        this.isStreamInProgress = false;
        this.previousFrequencyOfset = 50;
        this.pointSonificationLength = 0.3;
        this.priority = SonificationLevel.polite;
    }
    public static getSonifierInstance(): Sonifier {
        if(!Sonifier.sonifierInstance) {
            Sonifier.sonifierInstance = new Sonifier();
        }    
        
        return Sonifier.sonifierInstance;
    }
    
    public playSimpleTone(this: Sonifier, dummyData:number[]): void{
        console.log("playTone: sonifying data", dummyData);
        
        let pointSonificationLength:number = 0.3;
        var previousFrequencyOfset: number = 50;
        var startTime: number = this.audioCtx.currentTime;

        let frequencyExtent = [16, 1e3];
        let dataExtent = d3.extent(dummyData);

        let frequencyScale = d3.scaleLinear().domain(dataExtent).range(frequencyExtent);

        for (let i = 0; i < dummyData.length; i++) {
            var scaledDataPoint = frequencyScale(dummyData[i]);
            this.sonifyPoint(scaledDataPoint)
            this.isStreamInProgress = true;
        }
        this.isStreamInProgress = false;
    }

    public playHighlightPointsWithNoise(this: Sonifier, dummyData:number[], highlightPoint:number): void{
        let frequencyExtent = [16, 1e3];
        let dataExtent = d3.extent(dummyData);

        let frequencyScale = d3.scaleLinear().domain(dataExtent).range(frequencyExtent);
        
        for (let i = 0; i < dummyData.length; i++) {
          let frequencyOffset:number = frequencyScale(dummyData[i]);        // frequencyOfset = frequencyOfset%1000;
            
            console.log("frequency ofset", frequencyOffset);
            if(dummyData[i] == highlightPoint) {
                this.sonifyPoint(frequencyOffset,SonificationLevel.polite,SonificationType.NoiseHighlight)
            } else {
                this.sonifyPoint(frequencyOffset)
            }
            this.isStreamInProgress = true;
    
        }
        this.isStreamInProgress = false;     
    }

    private scheduleNoiseNode() {
        let noiseNode = this.createNoiseBufferNode();
        let bandPassFilterNode = this.createBandPassFilterNode();
        noiseNode.connect(bandPassFilterNode).connect(this.audioCtx.destination);
        noiseNode.start(this.startTime);
        noiseNode.stop(this.endTime);
        this.audioQueue.enqueue(noiseNode)
        // this.audioQueue.enqueue(bandPassFilterNode)
    }

    private sonifyPoint(dataPoint: number, priority:SonificationLevel = SonificationLevel.polite, sonificationType:SonificationType = SonificationType.Tone) { 
        console.log("in sonify point. datapoint:",dataPoint);

        console.log("isStreamInProgress",this.isStreamInProgress)
        if(priority == SonificationLevel.rude && this.priority != SonificationLevel.rude)
        {
            this.audioQueue.emptyAudioQueue();
            this.startTime = this.audioCtx.currentTime;
            this.endTime = this.startTime;
        }
        if (!this.isStreamInProgress )
        {
            this.previousFrequencyOfset = 50;
            this.audioQueue.emptyAudioQueue();
            this.isStreamInProgress = true
        }
        if(this.audioCtx.currentTime < this.endTime) // method is called when a previous tone is still scheduled to play.
        {
            this.startTime = this.endTime;
        } else {
            this.audioQueue.emptyAudioQueue();
            this.startTime= this.audioCtx.currentTime;   
        }
        this.endTime = this.startTime + this.pointSonificationLength;
        this.priority = priority; // to keep track of priority of previous point
        if(sonificationType == SonificationType.Tone)
        {
            this.scheduleOscilatorNode(dataPoint);
        }
        else if (sonificationType == SonificationType.Noise)
            {
            this.scheduleNoiseNode()
        }
        else if(sonificationType == SonificationType.NoiseHighlight)
        {
            this.scheduleNoiseNode()
            this.scheduleOscilatorNode(dataPoint)
        } else{
            throw new Error("not implemented.")
        }

        this.previousFrequencyOfset = dataPoint;
    }

    private scheduleOscilatorNode(dataPoint: number) {
        var osc = this.audioCtx.createOscillator();
        osc.frequency.value = this.previousFrequencyOfset;
        osc.frequency.linearRampToValueAtTime(dataPoint, this.startTime + this.pointSonificationLength);
        osc.connect(this.audioCtx.destination);
        osc.start(this.startTime);
        osc.stop(this.endTime);
        this.audioQueue.enqueue(osc);
    }

    private createBandPassFilterNode() {
        let bandPassFilterNode = this.audioCtx.createBiquadFilter();
        bandPassFilterNode.type = 'bandpass';
        bandPassFilterNode.frequency.value = 440;
        return bandPassFilterNode;
    }

    public playHighlightedRegionWithTones(this: Sonifier, dummyData:number[], beginRegion:number, endRegion:number): void{
        
        if(beginRegion > endRegion) {
            [beginRegion, endRegion] = [endRegion, beginRegion];
        }

        let frequencyExtent = [16, 1e3];
        let dataExtent = d3.extent(dummyData);

        let frequencyScale = d3.scaleLinear().domain(dataExtent).range(frequencyExtent);

        for (let i = 0; i < dummyData.length; i++)
        {
            var frequencyOffset = frequencyScale(dummyData[i]);
            if(dummyData[i] >= beginRegion && dummyData[i] <= endRegion) {
                this.sonifyPoint(frequencyOffset);
            } else {
                this.sonifyPoint(frequencyOffset, SonificationLevel.polite, SonificationType.Noise);
            }
            this.isStreamInProgress = true;
        }
    this.isStreamInProgress = false;
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
        this.sonifyPoint(2*dataPoint,level);
        
    }
    
}