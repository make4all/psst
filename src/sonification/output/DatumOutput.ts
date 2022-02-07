import { lastValueFrom, ReplaySubject } from 'rxjs'
import { Datum } from '../Datum'
import { OutputStateChange } from '../OutputConstants'

/**
 * Base class for outputing information about a single datum. Must be subclassed to be fully defined
 * @field datum The raw data used to generate this sonification type
 */
export abstract class DatumOutput extends ReplaySubject<Datum> {
    /**
     * Whether this is currently playing, paused, or stopped.
     */
    private _outputState = OutputStateChange.Undefined
    public get outputState(): OutputStateChange {
        return this._outputState
    }
    public setOutputState(value: OutputStateChange) {
        this._outputState = value
    }

    /**
     * Prints a description of this output
     */
    public toString(): string {
        return `${lastValueFrom(this)}$`
    }
}
