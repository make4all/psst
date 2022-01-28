import { Datum } from '../Datum'

/**
 * Base class for displaying a single datum. Must be subclassed to be fully defined
 * @field datum The raw data used to generate this sonification type
 */
export abstract class DatumDisplay {
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

    public stop() {
        console.log('datumDisplay.stop')
        this._datum = undefined
    }

    public start() {
        console.log('datumDisplay.start')
    }

    /**
     * prints a description of this display
     */
    public toString(): string {
        if (this._datum) return `DatumDisplay: ${this._datum.toString()}`
        else return 'Nothing to display'
    }

    /**
     * should be implemented to support pause for each of the display.
     * Each display knows best what it should do when it is asked to pause.
     * DisplayBoard asks each display to pause.
     */
    public abstract pause(): void

    /**
     * should be implemented to support resume for each of the display.
     * Each display knows best what it should do when it is asked to resume.
     * DisplayBoard asks each display to resume.
     */
    public abstract resume(): void
}
