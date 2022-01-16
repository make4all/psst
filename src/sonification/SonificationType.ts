import { Point } from "./Point";
import { Sonifier } from './Sonifier';
import { DisplayType } from "./DisplayType"

/**
 * Base class for sonifying a point. Abstract -- must be subclassed to be fully defined
 * @field volume Presuming here than anything you play would have a volume. 
 * @todo how is this combined with priority for point; and global volume?]
 * @field point The raw data used to generate this sonification type
 */

export abstract class SonificationType extends DisplayType {

    /**
     * The volume a sound will be played at
     */
    private _volume!: number;
    public get volume(): number {
        return this._volume;
    }
    public set volume(value: number) {
        this._volume = value;
    }

    /**
     * The length of time a sound will play for. Defaults to 10ms
     */
    private _duration: number = 10;
    public get duration(): number {
        return this._duration;
    }
    public set duration(value: number) {
        this._duration = value;
    }

    /**
     * An audio node that is configured to play this sound
     */
    private _audioNode!: AudioScheduledSourceNode;
    public get audioNode(): AudioScheduledSourceNode {
        return this._audioNode;
    }
    public set audioNode(value: AudioScheduledSourceNode) {
        this._audioNode = value;
    }


    /** 
     * @todo Should probably move to the sonifier class
     * @returns true if successful
     */
    public play(): boolean {
        this.audioNode.start();
        this.audioNode.stop(this.duration);
        return true;
    }

    /**
     * @constructor Stores relevant information. Value is derived from point.scaledValue.
     * @param point The raw data
     * @param audioNode The audio node whose configuration will fully specify this sound
     * @param volume The volume the sound should play at
     * @param duration The length of time the sound should play for
     */
    constructor(point: Point, audioNode: AudioScheduledSourceNode, volume:number, duration:number) {
        super(point)
        this.volume = volume;
        this.duration = duration;
        this.audioNode = audioNode;
    };

    /**
     * Must be overriden. Generates a new instance of a SonifiactionType from a point.
     *
     * @param point The raw data point to be sonified
     * @param volume The volume the sound should play at
     * @param duration The length of time the sound should play for
     * @returns Returns an instance of specific subclass of SonificationType.
     */
    public abstract makeOutput(point: Point, sonifier:Sonifier, volume?:number, duration?:number): DisplayType;
}
