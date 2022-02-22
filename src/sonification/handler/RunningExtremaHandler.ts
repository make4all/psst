import { filter, Observable, tap } from 'rxjs'
import { DatumOutput } from '../output/DatumOutput'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'
import { DataHandler } from './DataHandler'

const DEBUG = true

/**
 * A DataHandler that tracks the extrema of the data.
 */
export class RunningExtremaHandler extends DataHandler {

    /**
     * The relative extrema given the data thus far.
     */
    private _extrema: number
    public get extrema(): number {
        return this._extrema
    }
    public set extrema(value: number) {
        this._extrema = value
    }

    /**
     * Which extrema we're parsing for: -1 for minimum, 1 for maximum
     */
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
     * @param direction. -1 for minimum, 1 for maximum. Default to maximum if not provided.
     */
    constructor(output?: DatumOutput, direction?: number) {
        super(output)
        if (direction) {
            this._direction = direction
        } else {
            this._direction = 1
        }
        if (this._direction == 1) {
            this._extrema = Number.MIN_VALUE
        } else {
            this._extrema = Number.MAX_VALUE
        }
    }

    /**
     * Set up a subscription so we are notified about events
     * Override this if the data needs to be modified in some way
     *
     * @param sink The sink that is producing data for us
     */
    public setupSubscription(sink$: Observable<OutputStateChange | Datum>) {
        debugStatic (SonificationLoggingLevel.DEBUG, `setting up subscription for ${this} ${sink$}`)
        super.setupSubscription(
            sink$.pipe(
                filter((val) => {
                    if (val instanceof Datum){
                        debugStatic(SonificationLoggingLevel.DEBUG, `checking if ${val} is new extrema`)
                        if (this._direction == 1) {
                            if (val.value > this._extrema) {
                                if (DEBUG) console.log("new maximum", val.value)
                                this._extrema = val.value
                                return true
                            }
                            return false
                        } else {
                            if (val.value < this._extrema) {
                                if (DEBUG) console.log("new minimum", val.value)
                                this._extrema = val.value
                                return true
                            }
                            return false
                        }
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
        return `RunningExtremaHandler`
    }
}

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
import { Datum } from '../Datum'
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
