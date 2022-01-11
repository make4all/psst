import { AudioType, SonificationLevel, SonificationType } from './constents'

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
    sonificationType: SonificationType
    isHighlightPoint?: boolean
    isFenceOfRegionOfInterest?: boolean
    isInRegionOfInterest?: boolean
    alert?: boolean
}

export interface ISonificationType{
type: AudioType;
spokenText?: string; // the text to be spoken if the type is speech
value?:number; // the value that should be passed into the oscillator node or volume node.
Uri?:string // the location to an audio file to play if the user chooses to play the file when this point is processed.

}

export interface SonificationTemplate {
    Name:string; // a user-readable name of the template.
    highlight:SonificationType; // preferred sonification parameters to highlight a point with.
    nonHighlight?:SonificationType; // preferred way to not highlight a point.
    highlightCondition: (value:number) => boolean // if true, apply highlight sonification type.
    nonHighlightCondition?: (value:number) => boolean // if optional function is defined and returns true, apply non-highlight sonification type.
    Transformation? (value:number) : number; // optional function to transform the live data we see.
    Filter? (value:number): boolean // if this method exists and returns false, data processing will stop.
    apply(point:Point): Point; // applies the templates and returns the point to be sonified.
}


