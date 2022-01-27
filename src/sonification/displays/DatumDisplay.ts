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
    public abstract  show(): void;
    public abstract pause(): void;
    public abstract resume(): void;
}
