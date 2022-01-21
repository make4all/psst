import { NoteSonify } from '../displays/NoteSonify'
import * as d3 from 'd3'
import { Datum } from '../Datum'
import { ExceedDomainResponse, ScaleTemplate } from './ScaleTemplate'
import { DataSource } from '../DataSource'

/**
 * A template that displays a Datum as a note in the audible range.
 * Assumes a note should be played in the general range of 80 to 500 Hz to sound nice
 */
export class NoteTemplate extends ScaleTemplate {
    /**
     * Sets up a default target range that is audible
     * @param targetRange The audible range the note should be in
     * @param sourceRange The range of the incoming data
     * @param volume How loudly to play the note.
     */
    constructor(targetRange?: [number, number], volume?: number) {
        super(new NoteSonify(volume, undefined), ExceedDomainResponse.Expand, targetRange)
        this.range = targetRange ? targetRange : [100, 400]
        this.conversionFunction = (datum: Datum, domain: [number, number], range: [number, number]) => {
            let intermediateDomain = [100, 1]
            let positiveVal = d3.scaleLinear().domain(domain).range(intermediateDomain)(datum.value)
            let logVal = 2 - Math.log10(positiveVal)
            let logDomain = [0, 2]
            return d3.scaleLinear().domain(logDomain).range(range)(logVal)
        }
    }

    public toString(): string {
        return `NoteTemplate: Converting logarithmically to ${this.range[0]},${this.range[1]}`
    }
}
