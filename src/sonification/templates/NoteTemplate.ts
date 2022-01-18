import { DatumDisplay } from "../displays/DatumDisplay";
import { NoteSonify } from "../displays/NoteSonify";
import { ScaleTemplate } from "./ScaleTemplate";
import { ExceedRangeResponse } from "./ScaleTemplate";


/**
 * A template that displays a Datum as a note in the audible range.
 * Assumes a note should be played in the general range of 80 to 500 Hz to sound nice
 */
export class NoteTemplate extends ScaleTemplate {
    /**
     * Sets up a default target range that is audible 
     * @param targetRange The audible range the note should be in
     * @param sourceRange The range of the incoming data 
     * @param exceedRange 
     * @param duration 
     * @param volume 
     */
    constructor(display?: DatumDisplay, targetRange?: [number, number], sourceRange?: [number, number], exceedRange = ExceedRangeResponse.Expand, duration?: number, volume?: number) {
        super(new NoteSonify(duration, volume, undefined, true),
            targetRange ? targetRange : [80, 500],
            sourceRange, exceedRange);
    }


    public toString(): string {
        return `NoteTemplate: Converting to ${this.targetRange[0]},${this.targetRange[1]}`
    }
}