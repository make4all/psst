import { lastValueFrom, Observable, ReplaySubject, tap } from 'rxjs'
import { Datum } from '../Datum'
import { DataHandler } from '../handler/DataHandler'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'

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
     * Subscribe to the handler (override to modify or filter the stream in some way)
     *
     * @param handler$ An Output's stream of Datum comes from a DataHandlar
     */
    public setupSubscription(handler$: DataHandler) {
        handler$.pipe(debug(SonificationLoggingLevel.DEBUG, `outputing datum to output ${output}`)).subscribe(output)
    }

    /**
     * Prints a description of this output
     */
    public toString(): string {
        return `${lastValueFrom(this)}$`
    }
}
function output(output: any) {
    throw new Error('Function not implemented.')
}

const debug = (level: number, message: string) => (source: Observable<any>) =>
    source.pipe(
        tap((val) => {
            debugStatic(level, message + ': ' + val)
        }),
    )
const debugStatic = (level: number, message: string) => {
    if (level >= getSonificationLoggingLevel()) {
        console.log(message)
    } //else console.log('debug message dumped')
}
