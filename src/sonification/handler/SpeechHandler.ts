import * as d3 from 'd3'
import { Datum } from '../Datum'
import { DataSink } from '../DataSink'
import { DataHandler } from './DataHandler'
import { DatumOutput } from '../output/DatumOutput'
const DEBUG=true;
/**
 * A DataHandler that outputs a Datum as speech.
 */
export class SpeechHandler extends DataHandler {
    /**
     * Sets up a default target range that is audible. Uses the Mel Scale (https://www.wikiwand.com/en/Mel_scale)
     * @param volume How loudly to play the note.
     */
    constructor(volume?: number, output?: DatumOutput,) {
        super(output)
    }

    public toString(): string {
        return `SpeechTemplate`
    }
}
