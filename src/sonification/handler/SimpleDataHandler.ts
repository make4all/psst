import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DatumOutput } from '../output/DatumOutput'
import { DataHandler } from './DataHandler'
import { filter, Observable, tap } from 'rxjs'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLevel, SonificationLoggingLevel } from '../OutputConstants'

const DEBUG = true

/**
 * A DataHandler that notifies if a set of point/s are seen
  */
export class SimpleDataHandler extends DataHandler {
    /**
     * A set of points to be notified about. defaults to 0 if not specified in the constructor.
     */
    
    /**
     * Constructor
     *
     * @param sink. DataSink that is providing data to this Handler.
     * @param output. Optional output for this data
     * @param interestPoints [number[]. Defaults to 0 if not provided
     */
    constructor(output?: DatumOutput, interestPoints?: number[]) {
        super(output)
        // if (interestPoints) this._interestPoints = interestPoints
        // else this._interestPoints = [0]
    }

    /**
     * Set up a subscription so we are notified about events
     * Override this if the data needs to be modified in some way
     *
     * @param sink The sink that is producing data for us
     */
     public setupSubscription(sink$: Observable<OutputStateChange | Datum>) {
        super.setupSubscription(
            sink$.pipe(
                filter((val) => {
                    if (val instanceof Datum){
                        // return this.isInterestPoint(val.value)
                        return true
                    }
                    else return true
                }),
            ),
        )
    }

    /**
     * @returns A string describing this class including its range.
     */
    public toString(): string {
        return `SimpleDataHandler: notifying of all points`
    }
}

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'

const debug = (level: number, message: string, watch: boolean) => (source: Observable<any>) => {
    if (watch) {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + val)
            }),
            tag(message),
        )
    } else {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + val)
            }),
        )
    }
}

const debugStatic = (level: number, message: string) => {
    if (DEBUG) {
        if (level >= getSonificationLoggingLevel()) {
            console.log(message)
        } else console.log('debug message dumped')
    }
}