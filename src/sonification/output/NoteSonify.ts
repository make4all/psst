import { Datum } from '../Datum'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'
import { Sonify } from './Sonify'
import assert from 'assert'
import { Observable, tap } from 'rxjs'

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
    private playing = false

    /**
     * Stores relevant information when a new datum arrives
     * @param datum The data datum to be sonified (or undefined if there is nothing to pla )
     */
    public next(datum: Datum) {
        assert(this.outputState == OutputStateChange.Play, 'Should only be called if we are in Output mode')

        let oscillator = this.outputNode as OscillatorNode
        debugStatic(SonificationLoggingLevel.DEBUG, `updating value  ${datum.value}`)
        oscillator.frequency.value = datum.value
    }

    /**
     * Stop all notes. This tells the oscillator to stop playing.
     */
    protected stop() {
        let oscillator = this.outputNode as OscillatorNode
        oscillator?.stop()
        this.outputNode = Sonify.audioCtx.createOscillator()
        this.playing = false
        super.stop()
    }

    /**
     * Start playing the current datum. This starts the oscillator again.
     */
    protected start() {
        if (this.outputState == OutputStateChange.Stop) {
            let oscillator = this.outputNode as OscillatorNode

            oscillator?.start()
            this.playing = true
        }
        super.start()
    }

    /**
     * Generates a new note sonifier
     */
    public constructor() {
        super(Sonify.audioCtx.createOscillator())

        let oscillator = this.outputNode as OscillatorNode
        if (oscillator == undefined) {
            // oscillator = Sonifier.audioCtx.createOscillator()
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
