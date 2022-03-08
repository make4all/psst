import { Datum } from '../Datum'
import { getSonificationLoggingLevel, SonificationLoggingLevel } from '../OutputConstants'
import { Sonify } from './Sonify'
import { Observable, tap } from 'rxjs'

const DEBUG = false

/**
 * Class for sonifying a data point as a pitch.
 * @extends Sonify
 *
 * @field smooth: Should the note smoothly transition from the pitch of the previous data point?
 *
 * [note may want to think about whether supporting cohices for different animations besides linearRampToValueAtTime]
 * [note implementation not complete. Needs to handle scheduleSound still]
 */
export class NoteSonify extends Sonify {
    /**
     * Stop all notes. This tells the oscillator to stop playing.
     */
    protected stop() {
        debugStatic(SonificationLoggingLevel.DEBUG, 'Stopping Playback')
        let oscillator = this.outputNode as OscillatorNode
        // Need to prevent calling stop on OscillatorNode if start() is never called
        // For now use a try catch to handle the error
        try {
            oscillator?.stop()
        } catch (e) {
            console.log(e)
        }
        super.stop()
    }

    /**
     * Start playing the current datum. This starts the oscillator again.
     */
    protected start() {
        debugStatic(SonificationLoggingLevel.DEBUG, 'starting oscillator')
        let oscillator = this.outputNode as OscillatorNode
        if (!this.isAudioPlaying) {
            oscillator.start()
            this.isAudioPlaying = true
        }
        super.start()
    }

    /**
     * Show the output
     */
    protected output(datum: Datum) {
        debugStatic(SonificationLoggingLevel.DEBUG, `outputing ${datum.value} to oscillator`)
        let oscillator = this.outputNode as OscillatorNode

        oscillator.frequency.value = datum.value
    }

    /**
     * Generates a new note sonifier
     */
    public constructor(pan: number = 0) {
        super(Sonify.audioCtx.createOscillator(), pan)

        let oscillator = this.outputNode as OscillatorNode
        if (oscillator == undefined) {
            debugStatic(SonificationLoggingLevel.DEBUG, 'creating oscillator')
            oscillator = Sonify.audioCtx.createOscillator()
            this.outputNode = oscillator
        }
    }

    /**
     *
     * @returns A string describing the current frequency being played.
     */
    public toString(): string {
        let oscillator = this.outputNode as OscillatorNode
        if (oscillator) return `NoteSonify playing ${oscillator.frequency.value}`
        else return `NoteSonify not currently playing`
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
        } //else console.log('debug message dumped')
    }
}
