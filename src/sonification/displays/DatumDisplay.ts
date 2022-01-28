import { Datum } from '../Datum'

/**
 * Base class for displaying a single datum. Must be subclassed to be fully defined
 * @field datum The raw data used to generate this sonification type
 */
export class DatumDisplay {
    /**
     * The datum to display
     */
    private _datum?: Datum
    public getDatum(): Datum | undefined {
        return this._datum
    }
    public update(value?: Datum) {
        this._datum = value
    }

    /**
     * prints a description of this display
     */
    public toString(): string {
        if (this._datum) return `DatumDisplay: ${this._datum.toString()}`
        else return 'Nothing to display'
    }
}
