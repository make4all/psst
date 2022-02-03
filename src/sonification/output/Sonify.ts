import { Datum } from '../Datum'
import { OutputState } from '../OutputConstants'
import { DatumOutput } from './DatumOutput'
let DEBUG: boolean = true

/**
 * Base class for sonifying a datum. Abstract -- must be subclassed to be fully defined
 * @field volume Presuming here than anything you play would have a volume.
 * @todo how is this combined with priority for datum; and global volume?]
 * @field datum The raw data used to generate this sonification type
 */
export class Sonify extends DatumOutput {
    /**
     * Every output that extends this needs an audio context used to play sounds.
     * Sonify will keep control of that audio context and ensure that only 1 audio context exists.
     */
    private static _audioCtx = new AudioContext()
    public static get audioCtx(): AudioContext {
        return Sonify._audioCtx
    }
    private static _gainNode: GainNode
    public static get gainNode(): GainNode {
        return Sonify._gainNode
    }
    public static set gainNode(value: GainNode) {
        Sonify._gainNode = value
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
    update(datum?: Datum) {
        super.update(datum)
    }

    /**
     * Stop all output. Stream has ended.
     */
    stop() {
        super.stop()
        this.outputNode?.disconnect()
    }

    /**
     * Connects the oscillator node so that playback will resume.
     */
    public start() {
        if (this.outputState == OutputState.Outputting&& Sonify.audioCtx.state == 'running') {
            if (DEBUG) console.log('playing')
        } else {
            if (DEBUG) console.log('setting up for playing')
            Sonify.audioCtx.resume()
            Sonify.gainNode.connect(Sonify.audioCtx.destination)
            this.outputNode?.connect(Sonify.gainNode)
            this.outputState = OutputState.Outputting
        }
        super.start()
    }

    /**
     * Pause suspends current playing of audio and disconnects the oscillator node.
     * Not currently working.
     */
    public pause(): void {
        if (DEBUG) console.log('Pausing. Playback state is paused')
        Sonify.audioCtx.suspend()
        Sonify.gainNode.disconnect()
        super.pause()
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

        if (!this.outputNode) this.outputNode = audioNode

        this.outputState = OutputState.Stopped
        Sonify._audioCtx.resume()
        Sonify.gainNode = Sonify._audioCtx.createGain()
        if (volume) this.volume = volume
        if (audioNode) audioNode.connect(Sonify.gainNode)
    }

    /**
     *
     * @returns A string representing this object.
     */
    public toString(): string {
        return `Sonify`
    }
}
