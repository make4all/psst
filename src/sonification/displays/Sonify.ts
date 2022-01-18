import { Datum } from "../Datum";
import { Sonifier } from "../Sonifier";
import { DatumDisplay } from "./DatumDisplay"

/**
 * Base class for sonifying a datum. Abstract -- must be subclassed to be fully defined
 * @field volume Presuming here than anything you play would have a volume. 
 * @todo how is this combined with priority for datum; and global volume?]
 * @field datum The raw data used to generate this sonification type
 */

export class Sonify extends DatumDisplay {

    /**
     * The length of time a sound will play for. Defaults to 10ms
     */
    private _duration: number = -1;
    public get duration(): number {
        return this._duration;
    }
    public set duration(value: number) {
        this._duration = value;
    }
    
    /**
     * The volume a sound will be played at
     */
    private _volume: number = 5;
    public get volume(): number {
        return this._volume;
    }
    public set volume(value: number) {
        this._volume = value;
    }

    /**
     * An audio node that must be configured to play this sound
     */
    private _audioNode: AudioNode | undefined;
    public getAudioNode(sonifier?: Sonifier): AudioNode | undefined {
        console.log("returning audio node")
        return (this._audioNode) 
    }
    public setAudioNode(audioNode: AudioNode) {
        this._audioNode = audioNode;
    }

    /**
     * Stores relevant information when a new datum arrives. Value is derived from datum.scaledValue.
     * @param datum The raw data
     * @param audioNode The audio node whose configuration will fully specify this sound
     * @param volume The volume the sound should play at
     * @param duration The length of time the sound should play for
     */
    update(datum: Datum) {
        super.update(datum)
    };

    /**
     * Must be overriden. Generates a new instance of a SonificationType from a datum.
     *
     * @param datum The raw datum to be sonified
     * @param volume The volume the sound should play at
     * @param duration The length of time the sound should play for
     * @param optionally include an audio node that can be played
     * @returns Returns an instance of specific subclass of SonificationType.
     */
    constructor(duration?: number, volume?: number, audioNode?: AudioScheduledSourceNode) {
        super();
        if (volume) this.volume = volume;
        if (duration) this.duration = duration;
        if (audioNode) this._audioNode = audioNode;
    }


    public toString(): string {
        return `Sonify`
    }
}

