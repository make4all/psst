import { Datum } from '../Datum'
import { DisplayState } from '../SonificationConstants'

/**
 * Base class for displaying a single datum. Must be subclassed to be fully defined
 * @field datum The raw data used to generate this sonification type
 */
export abstract class DatumDisplay {
    /**
     * Whether this is currently playing, paused, or stopped.
     */
    private _displayState = DisplayState.Stopped
    public get displayState(): DisplayState {
        return this._displayState
    }
    public set displayState(value: DisplayState) {
        this._displayState = value
    }

    /**
     * The datum to display
     */
    private _datum?: Datum
    public getDatum(): Datum | undefined {
        return this._datum
    }

    /**
     * Update the display with a new value
     *
     * @param value The new datum
     */
    public update(value?: Datum) {
        this._datum = value
    }

    /**
     * Stop displaying the current value
     */
    public stop() {
        console.log('datumDisplay.stop')
        this._datum = undefined
        this._displayState = DisplayState.Stopped
    }

    /**
     * Set up for display. Datum will only be displayed after this is called.
     */
    public start() {
        console.log('datumDisplay.start')
        this._displayState = DisplayState.Displaying
    }

    /**
     * should be implemented to support pause for each of the display.
     * Each display knows best what it should do when it is asked to pause.
     * DisplayBoard asks each display to pause.
     */
    public pause(): void {
        this.displayState = DisplayState.Paused
    }

    /**
     * prints a description of this display
     */
    public toString(): string {
        if (this._datum) return `DatumDisplay: ${this._datum.toString()}`
        else return 'Nothing to display'
    }
}
