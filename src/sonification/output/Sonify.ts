import assert from 'assert'
import { Observable, tap } from 'rxjs'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'
import { DatumOutput } from './DatumOutput'

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

    public setOutputState(value: OutputStateChange) {
        switch (value) {
            case OutputStateChange.Stop: {
                this.stop()
                break
            }
            case OutputStateChange.Play: {
                this.start()
                break
            }
            case OutputStateChange.Pause: {
                this.pause()
            }
        }
        super.setOutputState(value)
    }

    /**
     * Stop all output. Stream has ended.
     */
    protected stop() {
        debugStatic(SonificationLoggingLevel.DEBUG, 'Stopping Playback')

        this.outputNode?.disconnect()
    }

    /**
     * Connects the oscillator node so that playback will resume.
     */
    protected start() {
        assert(
            this.outputState == OutputStateChange.Play,
            `This should never happen: asked to play while already playing ${this}`,
        )
        debugStatic(SonificationLoggingLevel.DEBUG, 'Playing. Was not previously playing')

        Sonify.audioCtx.resume()
        Sonify.gainNode.connect(Sonify.audioCtx.destination)
        this.outputNode?.connect(Sonify.gainNode)
    }

    /**
     * Pauses playback
     */
    protected pause() {
        debugStatic(SonificationLoggingLevel.DEBUG, 'Pausing. Playback state is paused')
        Sonify.audioCtx.suspend()
        Sonify.gainNode.disconnect()
    }

    /**
     * Must be overriden. Generates a new instance of a SonificationType from a datum.
     *
     * @param volume The volume the sound should play at
     * @param optionally include an audio node that can be played
     * @returns Returns an instance of specific subclass of SonificationType.
     */
    constructor(audioNode?: AudioScheduledSourceNode) {
        super()

        if (!this.outputNode) this.outputNode = audioNode
        if (!Sonify.gainNode) Sonify.gainNode = Sonify._audioCtx.createGain()
    }
    /// TODO: Possible additional values
    /// @param duration The length of time over which to change to the new pitch. Defaults to 10 ms
    /// @param volume The volume to play the note at. Can be overriden globally
    /// @param smooth Whether to connect the notes in the sequence being played. If undefined, defaults to true.

    /**
     *
     * @returns A string representing this object.
     */
    public toString(): string {
        return `Sonify`
    }
}

const debug = (level: number, message: string) => (source: Observable<any>) =>
    source.pipe(
        tap((val) => {
            debugStatic(level, message + ': ' + val)
        }),
    )
const debugStatic = (level: number, message: string) => {
    if (level >= getSonificationLoggingLevel()) {
        console.log(message)
    } //else console.log('debug message dumped')
}
