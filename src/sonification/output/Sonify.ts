import assert from 'assert'
import { filter, Observable, tap } from 'rxjs'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'
import { DatumOutput } from './DatumOutput'

const DEBUG =  false

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
    private _stereoPannerNode: StereoPannerNode
    public get stereoPannerNode(): StereoPannerNode {
        return this._stereoPannerNode
    }
    public  set stereoPannerNode(value: StereoPannerNode) {
        this._stereoPannerNode = value
    }
    public static get audioCtx(): AudioContext {
        return Sonify._audioCtx
    }
    private _gainNode: GainNode
    public get gainNode(): GainNode {
        return this._gainNode
    }
    public set gainNode(value: GainNode) {
        this._gainNode = value
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
     * a boolean to keep track whether the oscillator node is playing.
     * We need this to start the oscillator only when it sees the first datum.
     */
    protected isAudioPlaying: boolean

    /**
     * Stop all output. Stream has ended.
     */
    protected stop() {
        debugStatic(SonificationLoggingLevel.DEBUG, 'Stopping Playback')
        this.outputNode?.disconnect()
        this.isAudioPlaying = false;
        super.stop()
    }

    /**
     * Connects the oscillator node so that playback will resume.
     */
    protected start() {
        debugStatic(SonificationLoggingLevel.DEBUG, 'Starting')
        Sonify.audioCtx.resume()
        this.gainNode.connect(Sonify.audioCtx.destination)
        this.stereoPannerNode.connect(this.gainNode)
        this.outputNode?.connect(this.stereoPannerNode)
        super.start()
    }

    /**
     * Pauses playback
     */
    protected pause() {
        debugStatic(SonificationLoggingLevel.DEBUG, 'Pausing. Playback state is paused')
        Sonify.audioCtx.suspend()
        // Sonify.gainNode.disconnect()
        super.pause()
    }

    /**
     * Resumes playback
     */
    protected resume() {
        debugStatic(SonificationLoggingLevel.DEBUG, 'Resuming. Playback state is resumed')
        Sonify.audioCtx.resume()
        this.gainNode.connect(Sonify.audioCtx.destination)
        this.outputNode?.connect(this.gainNode)
        super.resume()
    }

    /**
     * Must be overriden. Generates a new instance of a SonificationType from a datum.
     *
     * @param volume The volume the sound should play at
     * @param optionally include an audio node that can be played
     * @returns Returns an instance of specific subclass of SonificationType.
     */
    constructor(audioNode?: AudioScheduledSourceNode,pan:number = 0) {
        super()

        if (!this.outputNode) this.outputNode = audioNode
         this._gainNode = Sonify._audioCtx.createGain()
         this._stereoPannerNode = Sonify._audioCtx.createStereoPanner()
        this.stereoPannerNode.pan.value = pan
        this.isAudioPlaying = false
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

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
const debug = (level: number, message: string, watch: boolean) => (source: Observable<any>) => {
    if (watch) {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + val)
            }),
            tag(message),
        )
    } else {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + val)
            }),
        )
    }
}

const debugStatic = (level: number, message: string) => {
    if (DEBUG) {
        if (level >= getSonificationLoggingLevel()) {
            console.log(message)
        } else console.log('debug message dumped')
    }
}
