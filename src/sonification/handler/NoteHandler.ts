import { NoteSonify } from '../output/NoteSonify'
import * as d3 from 'd3'
import { Datum } from '../Datum'
import { ExceedDomainResponse, ScaleHandler } from './ScaleHandler'
import { DataSink } from '../DataSink'

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
    constructor(sink?: DataSink, targetRange?: [number, number], volume?: number) {
        super(sink, new NoteSonify(volume, undefined), ExceedDomainResponse.Expand, targetRange)
        this.range = targetRange ? targetRange : [100, 400]
        this.conversionFunction = (datum: Datum, domain: [number, number], range: [number, number]) => {
            let intermediateDomain = [80, 450]
            let positiveVal = d3.scaleLinear().domain(domain).range(intermediateDomain)(datum.value)
            let frequency = 700 * (Math.exp(positiveVal / 1127) - 1)
            return frequency
        }
    }

    public toString(): string {
        return `NoteHandler: Converting logarithmically from ${this.domain[0]}, ${this.domain[1]} to ${this.range[0]},${this.range[1]}`
    }
}
