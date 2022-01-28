import { Datum } from '../Datum'

/**
 * Base class for displaying a single datum. Must be subclassed to be fully defined
 * @field datum The raw data used to generate this sonification type
 */
export abstract class DatumDisplay {
    /**
     * The datum to display
     */
    private _datum!: Datum
    public get datum(): Datum {
        return this._datum
    }
    public set datum(value: Datum) {
        this._datum = value
    }

    /**
     * Stores relevant information. Value is derived from point.scaledValue.
     * @param datum The raw datum
     */
    update(datum: Datum) {
        this.datum = datum
    }

    /**
     * prints a description of this display
     */
    public toString(): string {
        return `DatumDisplay: ${this.datum.toString()}`
    }

    /**
     * called when the DisplayBoard's onPlay is called. should contain the logic to trigger specific output.
     * Existing implementations use this for example to connect the oscillator in NoteSonify.
     */
    public abstract  show(): void;

    /**
     * should be implemented to support pause for each of the display.
     * Each display knows best what it should do when it is asked to pause.
     * DisplayBoard asks each display to pause.
     */
    public abstract pause(): void;
    
    /**
     * should be implemented to support resume for each of the display.
     * Each display knows best what it should do when it is asked to resume.
     * DisplayBoard asks each display to resume.
     */
    public abstract resume(): void;
}
