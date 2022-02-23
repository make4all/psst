import { filter, map, Observable, tap, withLatestFrom } from 'rxjs'
import { DatumOutput } from '../output/DatumOutput'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'
import { DataHandler } from './DataHandler'

const DEBUG = true

/**
 * A DataHandler that tracks the slope of the data
 * @todo change this to take a function that decides how to filter?
 */
export class SlopeParityHandler extends DataHandler {
    private _direction: number
    public get direction(): number {
        return this._direction
    }
    public set direction(value: number) {
        this._direction = value
    }

    /**
     * Constructor
     *
     * @param sink. DataSink that is providing data to this Handler.
     * @param output. Optional output for this data
     * @param direction. -1 for decreasing, 1 for increasing. Defaults to 0 if not provided.
     */
    constructor(output?: DatumOutput, direction?: number) {
        super(output)
        if (direction) {
            this._direction = direction
        } else {
            this._direction = 0
        }
    }

    /**
     * Set up a subscription so we are notified about events
     * Override this if the data needs to be modified in some way
     *
     * @param sink The sink that is producing data for us
     */
    public setupSubscription(sink$: Observable<OutputStateChange | Datum>) {
        debugStatic(SonificationLoggingLevel.DEBUG, `setting up subscription for ${this} ${sink$}`)
        let slope$ = new SlopeChange(3, sink$)

        super.setupSubscription(
            sink$.pipe(
                withLatestFrom(slope$),
                filter((vals) => vals[1] != this.direction),
                map((vals) => vals[0]),
            ),
        )
    }

    /**
     * @returns A string describing this class including its range.
     */
    public toString(): string {
        return `SlopeParityHandler`
    }
}

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
import { Datum } from '../Datum'
import { SlopeChange } from '../stat/SlopeChange'
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
