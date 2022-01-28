import { Datum } from '../Datum'
import { Sonify } from './Sonify'
import { Sonifier } from '../Sonifier'
import { ThirteenMpSharp } from '@mui/icons-material'

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
    private playing = false

    /**
     * Stores relevant information when a new datum arrives
     * @param datum The data datum to be sonified (or undefined if there is nothing to pla )
     * @param duration The length of time over which to change to the new pitch. Defaults to 10 ms
     * @param volume The volume to play the note at. Can be overriden globally
     * @param smooth Whether to connect the notes in the sequence being played. If undefined, defaults to true.
     */
    public update(datum?: Datum, duration = 200, volume?: number, smooth?: boolean) {
        super.update(datum)
        let oscillator = this.outputNode as OscillatorNode
        if (datum) {
            if (DEBUG) console.log(`updating value  ${datum.adjustedValue}`)
            oscillator.frequency.value = datum.adjustedValue
            if (!this.playing) {
                oscillator.start()
                this.playing = true
            }
        } else {
            oscillator.stop()
            this.playing = false
        }
    }

    stop() {
        super.stop()
        let oscillator = this.outputNode as OscillatorNode
        oscillator?.stop()
        this.outputNode = Sonifier.audioCtx.createOscillator()
        this.playing = false
    }

    start() {
        super.start()
        let oscillator = this.outputNode as OscillatorNode
        oscillator?.start()
        this.playing = true
    }
    /**
     * Generates a new note sonifier
     * @param volume The volume the sound should play at
     * @param optionally include an audio node that can be played
     * @returns Returns an instance of specific subclass of SonificationType.
     */
    public constructor(volume?: number, audioNode?: AudioScheduledSourceNode) {
        super(volume, Sonifier.audioCtx.createOscillator())

        let oscillator = this.outputNode as OscillatorNode
        if (oscillator == undefined) {
            // oscillator = Sonifier.audioCtx.createOscillator()
            this.outputNode = oscillator
        }
    }

    public toString(): string {
        let oscillator = this.outputNode as OscillatorNode
        if (oscillator) return `NoteSonify playing ${oscillator.frequency.value}`
        else return `NoteSonify not currently playing`
    }
}
