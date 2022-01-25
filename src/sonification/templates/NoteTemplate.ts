import { NoteSonify } from '../displays/NoteSonify'
import * as d3 from 'd3'
import { Datum } from '../Datum'
import { ExceedDomainResponse, ScaleTemplate } from './ScaleTemplate'

/**
 * A template that displays a Datum as a note in the audible range.
 * Assumes a note should be played in the general range of 80 to 500 Hz to sound nice
 */
export class NoteTemplate extends ScaleTemplate {
    /**
     * Sets up a default target range that is audible. Uses the Mel Scale (https://www.wikiwand.com/en/Mel_scale)
     * @param targetRange The audible range the note should be in
     * @param sourceRange The range of the incoming data
     * @param volume How loudly to play the note.
     */
    constructor(targetRange?: [number, number], volume?: number) {
        super(new NoteSonify(volume, undefined), ExceedDomainResponse.Expand, targetRange)
        this.range = targetRange ? targetRange : [100, 400]
        this.conversionFunction = (datum: Datum, domain: [number, number], range: [number, number]) => {
            let intermediateDomain = [80, 450]
            let positiveVal = d3.scaleLinear().domain(domain).range(intermediateDomain)(datum.value)
            let frequency = 700 * (Math.exp(positiveVal / 1127) - 1)
            return frequency
        }
    }

    public toString(): string {
        return `NoteTemplate: Converting logarithmically to ${this.range[0]},${this.range[1]}`
    }
}
