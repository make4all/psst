import { AudioType, NoiseType, SonificationLevel, SonificationParam, OldSonificationType } from './constents'

export class AudioQueue {
    private storage: { [index: number]: AudioScheduledSourceNode }
    private enqueuePointer: number
    private dequeuePointer: number

    public constructor() {
        this.dequeuePointer = 0
        this.enqueuePointer = 0
        this.storage = Object.create(null)
    }
    public enqueue(item: AudioScheduledSourceNode) {
        this.storage[this.enqueuePointer] = item
        this.enqueuePointer++
    }

    public dequeue(): AudioScheduledSourceNode | undefined {
        if (this.dequeuePointer !== this.enqueuePointer) {
            const dequeuedData = this.storage[this.dequeuePointer]
            dequeuedData.stop()
            delete this.storage[this.dequeuePointer]
            this.dequeuePointer++
            return dequeuedData
        }
        return undefined
    }
    public emptyAudioQueue(): void {
        while (this.enqueuePointer !== this.dequeuePointer) this.dequeue()
    }
}

export interface Point {
    value: number
    scaledValue: number
    Priority: SonificationLevel
    legacySonificationType: OldSonificationType
    SonificationType?: SonificationType[]
    // isHighlightPoint?: boolean
    // isFenceOfRegionOfInterest?: boolean
    // isInRegionOfInterest?: boolean
    // alert?: boolean
}

export interface SonificationType {
    type: AudioType
    volume: number
}
export class Filter {
    filter(value: number): boolean {
        return true
    }
}

export class MaxFilter extends Filter {
    maxkey: string
    epsilon: number
    constructor(key="max") {
        super()
        this.maxkey = key
        this.epsilon = 5
    
    } 
    // filter(value:number): boolean {
    //     // let max = mySource.stats[maxkey].getValue()
    //     if (value + this.epsilon) >= max return true
    //     // implementation
    //     return false
    // }
}

export class SonificationTemplate {
    Name: string = "" // a user-readable name of the template.
    // highlight: SonificationType // preferred sonification parameters to highlight a point with.
    nonHighlight?: SonificationType // preferred way to not highlight a point.
    private highlightCondition (value: number) : boolean // if true, apply highlight sonification type.
    {
        return true;
    }
    
public     apply(point: Point): Point // applies the templates and returns the point to be sonified.
{
    return point; // default.
}
}

export class AdjustedPitch extends SonificationTemplate{
    max: number
    min: number
    constructor(max = Number.MIN_SAFE_INTEGER   , min = Number.MAX_SAFE_INTEGER) {
        super()
        this.max = max
        this.min = min
    }

    public apply(point: Point) {
        //  max = mySource.stats[maxkey]
        //  min = mySource.stats[minkey]
let ratio:number          = point.value/(this.max-this.min);
        //  this.pitch = ratio*herzrange 
         return point;
    }
}



class Tone implements SonificationType {
    private _type: AudioType = AudioType.Audio
    public get type(): AudioType {
        return this._type
    }

    private _value: number
    public get value(): number {
        return this._value
    }
    private set value(value: number) {
        this._value = value
    }

    private _param: SonificationParam
    public get param(): SonificationParam {
        return this._param
    }

    private _duration: number
    public get duration(): number {
        return this._duration
    }
    public set duration(value: number) {
        this._duration = value
    }
    private _volume: number
    public get volume(): number {
        return this._volume
    }
    public set volume(value: number) {
        this._volume = value
    }
    public constructor(
        param: SonificationParam,
        value: number,
        volume: number = 1.0, // default volume is 1.
    ) {
        this._param = param
        this._value = value
        this._duration = 0.3
        this._volume = volume
    }
}

class Noise implements SonificationType {
    private _type: AudioType = AudioType.Noise
    public get type(): AudioType {
        return this._type
    }
    private _noiseType: NoiseType
    public get noiseType(): NoiseType {
        return this._noiseType
    }
    private _duration: number
    public get duration(): number {
        return this._duration
    }
    public set duration(value: number) {
        this._duration = value
    }
    private _volume: number
    public get volume(): number {
        return this._volume
    }
    public set volume(value: number) {
        this._volume = value
    }

    public constructor(duration, volume: number = 1.0) {
        this._duration = duration
        this._noiseType = NoiseType.white
        this._volume = volume
    }
}
