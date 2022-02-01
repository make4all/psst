import { Speech } from '../displays/Speech'
import * as d3 from 'd3'
import { Datum } from '../Datum'
import { DataSource } from '../DataSource'
import { Template } from './Template'

/**
 * A template that displays a Datum as a note in the audible range.
 * Assumes a note should be played in the general range of 80 to 500 Hz to sound nice
 */
export class SpeechTemplate extends Template {
    /**
     * Sets up a default target range that is audible. Uses the Mel Scale (https://www.wikiwand.com/en/Mel_scale)
     * @param volume How loudly to play the note.
     */
    constructor(source?: DataSource, volume?: number) {
        super(source, new Speech())
    }

    public toString(): string {
        return `SpeechTemplate`
    }
}
