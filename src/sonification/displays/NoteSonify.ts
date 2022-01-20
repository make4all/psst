import { Datum } from '../Datum'
import { Sonify } from './Sonify'
import { Sonifier } from '../Sonifier'

const DEBUG = false;

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
     * Stores relevant information when a new datum arrives
     * @param datum The data datum to be sonified
     * @param duration The length of time over which to change to the new pitch. Defaults to 10 ms
     * @param volume The volume to play the note at. Can be overriden globally
     * @param smooth Whether to connect the notes in the sequence being played. If undefined, defaults to true.
     */
    public update(datum: Datum, duration = 200, volume?: number, smooth?: boolean) {
        super.update(datum)
        if (DEBUG) console.log(`updating value  ${this.datum.adjustedValue}`)
        let oscillator = this.outputNode as OscillatorNode
        oscillator.frequency.value = datum.adjustedValue
    }


    /**
     * Generates a new note sonifier
     * @param volume The volume the sound should play at
     * @param optionally include an audio node that can be played
     * @returns Returns an instance of specific subclass of SonificationType.
     */
    public constructor(volume?: number, audioNode?: AudioScheduledSourceNode) {
        super(volume, audioNode ? audioNode : Sonifier.audioCtx.createOscillator())
        let oscillator = this.outputNode as OscillatorNode;
        if (oscillator == undefined) {
            oscillator = Sonifier.audioCtx.createOscillator()
            this.outputNode = oscillator;
        }
        oscillator.start();
    }

    public toString(): string {
        let oscillator = this.outputNode as OscillatorNode;
        if (oscillator) return `NoteSonify playing ${oscillator.frequency.value}`
        else return `NoteSonify not currently playing`
    }
}
