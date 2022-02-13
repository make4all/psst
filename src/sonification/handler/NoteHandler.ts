import { NoteSonify } from '../output/NoteSonify'
import { ScaleHandler } from './ScaleHandler'
/**
 * A DataHandler that outputs a Datum as a note in the audible range.
 * Assumes a note should be played in the general range of 80 to 500 Hz to sound nice
 */
export class NoteHandler extends ScaleHandler {
    /**
     * Sets up a default target range that is audible. Uses the Mel Scale (https://www.wikiwand.com/en/Mel_scale)
     * @param sink. DataSink that is providing data to this Handler.
     * @param targetRange The audible range the note should be in
     * @param volume How loudly to play the note.
     */

    constructor(domain?: [number, number],pan:number=0) {
        super(NoteHandler.melConversion, domain, [80, 450], new NoteSonify(pan))
    }

    public static melConversion(num, domain, range): number {
        let positiveVal = ((num - domain[0]) * (range[1] - range[0])) / (domain[1] - domain[0]) + range[0]
        let frequency = 700 * (Math.exp(positiveVal / 1127) - 1)
        if (frequency == NaN || frequency == undefined) frequency = range[1]
        return frequency
    }
    public toString(): string {
        return `NoteHandler: Converting using Mel from ${this.domain[0]}, ${this.domain[1]} to ${this.range[0]},${this.range[1]}`
    }
}
