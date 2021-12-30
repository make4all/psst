// import { SonificationLevel } from './constents';
import { AudioQueue, Point} from './sonificationUtils'
import * as d3 from 'd3'
import { PlaybackState, SonificationLevel, SonificationType } from './constents'
//move enums to constants.ts . Currently seeing runtime JS error saying that the enum is not exported from constants.ts so placing them here to move forward with building.

export class Sonifier {
    // This is a singleton. need to create an interface and export an instance of the sonifier. Any advice on making this a singleton the right way?
    private static sonifierInstance: Sonifier
    protected audioCtx: AudioContext
    protected startTime: number
    protected endTime: number
    protected isStreamInProgress: boolean
    protected previousFrequencyOfset: number
    protected pointSonificationLength: number
    protected audioQueue: AudioQueue
    // protected priority: SonificationLevel
    protected didNodesFinishPlaying: boolean
    private _playbackState: PlaybackState
    private previousPlaybackState: PlaybackState
    private _data: Point[]
private     previousPriority: SonificationLevel
    public get data(): Point[] {
        return this._data
    }
    
    public get playbackState(): PlaybackState {
        return this._playbackState
    }
    public onPlaybackStateChanged?: (state: PlaybackState) => void
    private _pointQueue: [{}]
    public get pointQueue(): [{}] {
        return this._pointQueue
    }
    private currentDataPointIndex:number;
    private scheduleAheadTime:number;
    private nextPointTime:number;
    private timerID:number | undefined;
    

    private timerWorker:Worker;

    
    private constructor() {
        // super()
        this.audioCtx = new AudioContext() // works without needing additional libraries. need to check this when we move away from react as it is currently pulling from react-dom.d.ts.
        this.startTime = this.audioCtx.currentTime;
        this.nextPointTime = this.startTime;
        this.endTime = this.startTime;
        
        this.audioQueue = new AudioQueue()
        this.isStreamInProgress = false
        this.previousFrequencyOfset = 50
        this.pointSonificationLength = 0.3
        this.previousPriority = SonificationLevel.polite;
  
        this._playbackState = PlaybackState.Stopped
        this.previousPlaybackState = PlaybackState.Stopped
        this.didNodesFinishPlaying = true
        this._pointQueue = [{}];
        this.scheduleAheadTime = 2*this.pointSonificationLength; // we could compute this by computing the stream rate for data streams.
        this.currentDataPointIndex = 0;
        this.timerID = undefined;
        this._data = [];
        
        // need to test.
        // this.timerWorker = null;
        this.timerWorker = new Worker("timerWorker.ts");
        this.timerWorker.onmessage = (event) => {
            if(event.data == "tick")
            this.scheduler();
        }
    }
    public static getSonifierInstance(): Sonifier {
        if (!Sonifier.sonifierInstance) {
            Sonifier.sonifierInstance = new Sonifier()
        }

        return Sonifier.sonifierInstance
    }

    private fireTimer() {
        this.timerWorker.postMessage({"interval":this.scheduleAheadTime});
        this.timerWorker.postMessage("start");
    }

    private scheduler() {
        while(this.nextPointTime < this.audioCtx.currentTime+this.scheduleAheadTime && this.currentDataPointIndex < this.data.length)
        {
            this.pointQueue.push({pointIndex:this.currentDataPointIndex, dataPoint:this.data[this.currentDataPointIndex],time:this.nextPointTime});
            this.sonifyPoint(this.data[this.currentDataPointIndex],this.nextPointTime);
            this.nextPointTime += this.pointSonificationLength;
            this.currentDataPointIndex+=1;

        }
        // moved this part to a web worker. need to test.
        // this.timerID = window.setTimeout(this.scheduler,this.scheduleAheadTime);
    }

    public playSimpleTone(dummyData: number[]): void {
        // Flush the sonifier nodes that might be in use
        this.resetSonifier();
        // console.log('playTone: sonifying data', dummyData)
// this.data = dummyData;
        let frequencyExtent = [16, 1e3]
        let dataExtent = d3.extent(dummyData)

        let frequencyScale = d3.scaleLinear().domain(dataExtent).range(frequencyExtent)

        for (let i = 0; i < dummyData.length; i++) {
            let scaledDataPoint = frequencyScale(dummyData[i])
            this._data.push({value:dummyData[i], scaledValue:scaledDataPoint, Priority:SonificationLevel.polite, sonificationType:SonificationType.Tone});


        }
        this.fireTimer();
        this.isStreamInProgress = true;
    }

    public playHighlightPointsWithNoise(dummyData: number[], highlightPoint: number): void {
        // Flush the sonifier nodes that might be in use
        this.resetSonifier();

        let frequencyExtent = [16, 1e3]
        let dataExtent = d3.extent(dummyData)

        let frequencyScale = d3.scaleLinear().domain(dataExtent).range(frequencyExtent)

        for (let i = 0; i < dummyData.length; i++) {
            let scaledDataPoint: number = frequencyScale(dummyData[i]) // frequencyOfset = frequencyOfset%1000;

            // console.log('frequency ofset', frequencyOffset)
            if (dummyData[i] == highlightPoint) {
                this._data.push({value:dummyData[i], scaledValue:scaledDataPoint, Priority:SonificationLevel.polite, sonificationType:SonificationType.NoiseHighlight});
            } else {
                this._data.push({value:dummyData[i], scaledValue:scaledDataPoint, Priority:SonificationLevel.polite, sonificationType:SonificationType.Tone});
            }
        }
        this.fireTimer();
        this.isStreamInProgress = true;
    }

    private scheduleNoiseNode(pointTime:number) {
        let noiseNode = this.createNoiseBufferNode()
        let bandPassFilterNode = this.createBandPassFilterNode()
        noiseNode.onended = () => this.handelOnEnded()
        noiseNode.connect(bandPassFilterNode).connect(this.audioCtx.destination)
        noiseNode.start(pointTime)
        noiseNode.stop(pointTime+this.pointSonificationLength)
        this.audioQueue.enqueue(noiseNode)
        // this.audioQueue.enqueue(bandPassFilterNode)
        if (this.playbackState == PlaybackState.Stopped) {
            this._playbackState = PlaybackState.Playing
            this.firePlaybackStateChangedEvent()
        }
    }

    private sonifyPoint(
        dataPoint: Point,
        pointTime:number
        
    ) {
        console.log('in sonify point. datapoint:', dataPoint)

        console.log('isStreamInProgress', this.isStreamInProgress)
        if (dataPoint.Priority == SonificationLevel.assertive && this.previousPriority != SonificationLevel.assertive) {
            this.resetSonifier()
        }
        if (!this.isStreamInProgress) {
            this.resetSonifier();   
            this.isStreamInProgress = true
        }
        
        this.previousPriority = dataPoint.Priority; // to keep track of priority of previous point
        if (dataPoint.sonificationType == SonificationType.Tone) {
            this.scheduleOscilatorNode(dataPoint.scaledValue,pointTime)
        } else if (dataPoint.sonificationType == SonificationType.Noise) {
            this.scheduleNoiseNode(pointTime)
        } else if (dataPoint.sonificationType == SonificationType.NoiseHighlight) {
            this.scheduleNoiseNode(pointTime)
            this.scheduleOscilatorNode(dataPoint.scaledValue,pointTime)
        } else {
            throw new Error('not implemented.')
        }

        this.previousFrequencyOfset = dataPoint.scaledValue;

        
    }
    private resetSonifier() {
        this.audioQueue.emptyAudioQueue()
        this._data = [];
        this.nextPointTime = this.audioCtx.currentTime;
        this.currentDataPointIndex = 0;
        
    
        this.previousFrequencyOfset = 50;
        this.isStreamInProgress = false;
    }

    private scheduleOscilatorNode(dataPoint: number,pointTime:number) {
        let osc = this.audioCtx.createOscillator()
        osc.frequency.value = this.previousFrequencyOfset
        osc.frequency.linearRampToValueAtTime(dataPoint, pointTime  + this.pointSonificationLength)
        osc.onended = () => this.handelOnEnded()
        osc.connect(this.audioCtx.destination)
        osc.start(pointTime)
        osc.stop(pointTime+this.pointSonificationLength)
        this.audioQueue.enqueue(osc)
        if (this.playbackState == PlaybackState.Stopped) {
            this._playbackState = PlaybackState.Playing
            this.firePlaybackStateChangedEvent()
        }
    }

    private createBandPassFilterNode() {
        let bandPassFilterNode = this.audioCtx.createBiquadFilter()
        bandPassFilterNode.type = 'bandpass'
        bandPassFilterNode.frequency.value = 440
        return bandPassFilterNode
    }

    public playHighlightedRegionWithTones(dummyData: number[], beginRegion: number, endRegion: number): void {
        let point:Point;
        // Flush the sonifier nodes that might be in use
        this.resetSonifier();
        if (beginRegion > endRegion) {
            ;[beginRegion, endRegion] = [endRegion, beginRegion]
        }

        let frequencyExtent = [16, 1e3]
        let dataExtent = d3.extent(dummyData)

        let frequencyScale = d3.scaleLinear().domain(dataExtent).range(frequencyExtent)

        for (let i = 0; i < dummyData.length; i++) {
            let scaledDataPoint = frequencyScale(dummyData[i])
            if (dummyData[i] >= beginRegion && dummyData[i] <= endRegion) {
                point = {value:dummyData[i], scaledValue:scaledDataPoint, Priority:SonificationLevel.polite, sonificationType:SonificationType.Tone};
                point.isInRegionOfInterest = true;
            } else {
                point = {value:dummyData[i], scaledValue:scaledDataPoint, Priority:SonificationLevel.polite, sonificationType:SonificationType.Noise};
            }
            if(dummyData[i] == beginRegion || dummyData[i] == endRegion)
            point.isFenceOfRegionOfInterest = true;
            this._data.push(point);
        }
        this.isStreamInProgress = true;
        this.fireTimer();
    }

    private createNoiseBufferNode(): AudioBufferSourceNode {
        const noiseBufferSize: number = this.audioCtx.sampleRate * this.pointSonificationLength
        const buffer = this.audioCtx.createBuffer(1, noiseBufferSize, this.audioCtx.sampleRate)
        let bufferData = buffer.getChannelData(0)
        for (let i = 0; i < noiseBufferSize; i++) {
            bufferData[i] = Math.random() * 2 - 1
        }
        let noiseNode = this.audioCtx.createBufferSource()
        noiseNode.buffer = buffer
        return noiseNode
    }

    public SonifyPushedPoint(dataPoint: number, level: SonificationLevel) {
        // this.sonifyPoint(2 * dataPoint, level)
        this._data.push({value:dataPoint, scaledValue:2*dataPoint, Priority:level, sonificationType:SonificationType.Tone});
        this.isStreamInProgress = true;
        this.fireTimer();
    }

    //needs extensive testing.
    private handelOnEnded() {
        if (this.audioCtx.currentTime >= this.nextPointTime) {
            // This is the last node.
            console.log('playback ended. state before updation:', this.playbackState)
            this._playbackState = PlaybackState.Stopped
            this.isStreamInProgress = false;
        } else {
            this._playbackState = PlaybackState.Playing
        }
        console.log('playback state before firing onPlayBackStateChanged event', this.playbackState)
        this.firePlaybackStateChangedEvent()
    }

    public pauseToggle() {
        if (this.playbackState == PlaybackState.Playing && this.audioCtx.state == 'running') {
            console.log('playing')
            this.timerWorker.postMessage("stop");
            this.audioCtx.suspend()
            this._playbackState = PlaybackState.Paused
        } else {
            console.log('paused')
            this.audioCtx.resume()
            this._playbackState = PlaybackState.Playing;
            this.fireTimer();
        }
        this.firePlaybackStateChangedEvent()
    }
    private firePlaybackStateChangedEvent() {
        if (this.playbackState != this.previousPlaybackState) {
            this.previousPlaybackState = this.playbackState
            if (this.onPlaybackStateChanged) return this.onPlaybackStateChanged(this.playbackState)
        }
    }
}
