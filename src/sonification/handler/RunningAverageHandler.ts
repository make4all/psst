import { filter, map, Observable, tap, withLatestFrom } from 'rxjs'
import { DatumOutput } from '../output/DatumOutput'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'
import { DataHandler } from './DataHandler'
import { Slope } from '../stat/Slope'

const DEBUG = true

/**
 * A DataHandler that tracks the slope of the data
 * @todo change this to take a function that decides how to filter?
 */
export class RunningAverageHandler extends DataHandler {
    /**
     * Constructor
     *
     * @param sink. DataSink that is providing data to this Handler.
     * @param output. Optional output for this data
     * @param direction. -1 for decreasing, 1 for increasing. Defaults to 0 if not provided.
     */
    constructor(output?: DatumOutput) {
        super(output)
    }

    /**
     * Set up a subscription so we are notified about events
     * Override this if the data needs to be modified in some way
     *
     * @param sink The sink that is producing data for us
     */
    public setupSubscription(sink$: Observable<OutputStateChange | Datum>) {
        debugStatic(SonificationLoggingLevel.DEBUG, `setting up subscription for ${this} ${sink$}`)
        let runningAverage$ = new RunningAverage(sink$)

        super.setupSubscription(
            sink$.pipe(
                debug(SonificationLoggingLevel.DEBUG, 'runningAverageOutput val', true),
                withLatestFrom(runningAverage$),
                map((vals) => {
                    debugStatic(SonificationLoggingLevel.DEBUG, `vals ${vals} ${vals[1]}: vals`)
                    let datum = vals[0]
                    try {
                        datum.value = vals[1]
                    } catch (e: unknown) {
                        datum = vals[0]
                    }
                    return datum
                }),
                debug(SonificationLoggingLevel.DEBUG, 'runningAverageOutput val', true),
            ),
        )
    }

    /**
     * @returns A string describing this class including its range.
     */
    public toString(): string {
        return `RunningAverageHandler`
    }
}

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
import { Datum } from '../Datum'
import { RunningAverage } from '../stat/RunningAverage'
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
