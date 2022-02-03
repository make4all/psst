import { Datum } from '../Datum'
import { OutputState } from '../OutputConstants'

/**
 * Base class for outputing information about a single datum. Must be subclassed to be fully defined
 * @field datum The raw data used to generate this sonification type
 */
export abstract class DatumOutput {
    /**
     * Whether this is currently playing, paused, or stopped.
     */
    private _outputState = OutputState.Stopped
    public get outputState(): OutputState {
        return this._outputState
    }
    public set outputState(value: OutputState) {
        this._outputState = value
    }

    /**
     * The datum to be outputed
     */
    private _datum?: Datum
    public getDatum(): Datum | undefined {
        return this._datum
    }

    /**
     * Update the output with a new value
     *
     * @param value The new datum
     */
    public update(value?: Datum) {
        this._datum = value
    }

    /**
     * Stop outputting the current value
     */
    public stop() {
        console.log('datumOutput.stop')
        this._datum = undefined
        this._outputState = OutputState.Stopped
    }

    /**
     * Set up for output. Datum will only be outputted after this is called.
     */
    public start() {
        console.log('datumOutput.start')
        this._outputState = OutputState.Playing
    }

    /**
     * Should support pause for this output.
     * Each output knows best what it should do when it is asked to pause.
     */
    public pause(): void {
        this._outputState = OutputState.Paused
    }

    /**
     * Prints a description of this output
     */
    public toString(): string {
        if (this._datum) return `DatumOUtput: ${this._datum.toString()}`
        else return 'Nothing to output'
    }
}
