import { Datum } from '../Datum'
import { PlaybackState } from '../SonificationConstants'
import { DatumDisplay } from './DatumDisplay'
let DEBUG:boolean = true;
/**
 * Base class for sonifying a datum. Abstract -- must be subclassed to be fully defined
 * @field volume Presuming here than anything you play would have a volume.
 * @todo how is this combined with priority for datum; and global volume?]
 * @field datum The raw data used to generate this sonification type
 */

export class Sonify extends DatumDisplay {
    private _playbackState: PlaybackState;
    public get playbackState(): PlaybackState {
        return this._playbackState;
    }
    public set playbackState(value: PlaybackState) {
        this._playbackState = value;
    }
    public show(): void {
        if (this.playbackState == PlaybackState.Playing && Sonify.audioCtx.state == 'running') {
            if (DEBUG) console.log('playing')
        } else {
            if (DEBUG) console.log('setting up for playing')
            Sonify.audioCtx.resume()
            Sonify.gainNode.connect(Sonify.audioCtx.destination)
    }
}
    public pause(): void {
        if (DEBUG) console.log('Pausing. Playback state is paused')
        Sonify.audioCtx.suspend()
         Sonify.gainNode.disconnect()
        this._playbackState = PlaybackState.Paused
        throw new Error('Method not implemented.');
    }
    public resume(): void {
        throw new Error('Method not implemented.');
    }
    /**
     * Every display that extends this needs an audio context used to play sounds.
     * Sonify will keep control of that audio context and ensure that only 1 audio context exists.
     */
     private static _audioCtx = new AudioContext();
     public static get audioCtx(): AudioContext {
         return Sonify._audioCtx
     }
      private static _gainNode: GainNode;
    public static get gainNode(): GainNode {
        return Sonify._gainNode;
    }
    public static set gainNode(value: GainNode) {
        Sonify._gainNode = value;
    }
    /**
     * The volume a sound will be played at
     */
    protected _volume: number = 5
    public get volume(): number {
        return this._volume
    }
    public set volume(value: number) {
        this._volume = value
    }

    /**
     * An audio node that must be configured to play this sound
     */
    protected _outputNode: AudioNode | undefined
    protected get outputNode(): AudioNode | undefined {
        return this._outputNode
    }
    protected set outputNode(value: AudioNode | undefined) {
        this._outputNode = value
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
    }

    /**
     * Must be overriden. Generates a new instance of a SonificationType from a datum.
     *
     * @param volume The volume the sound should play at
     * @param optionally include an audio node that can be played
     * @returns Returns an instance of specific subclass of SonificationType.
     */
    constructor(volume?: number, audioNode?: AudioScheduledSourceNode) {
        super()
        this._playbackState = PlaybackState.Stopped
        Sonify._audioCtx.resume()
        Sonify.gainNode = Sonify._audioCtx.createGain()
        // if(!this.outputNode) this.outputNode = audioNode
        if (volume) this.volume = volume
        if (audioNode) audioNode.connect(Sonify.gainNode);
    }

    public toString(): string {
        return `Sonify`
    }
}
