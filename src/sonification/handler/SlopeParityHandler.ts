import { filter, Observable, tap } from 'rxjs'
import { DatumOutput } from '../output/DatumOutput'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'
import { DataHandler } from './DataHandler'

const DEBUG = true

/**
 * A DataHandler that tracks the slope of the data
 * @todo change this to take a function that decides how to filter?
 */
export class SlopeParityHandler extends DataHandler {
    /**
     * The slope between the previous two points.
     */
    private _prevSlope: number
    public get prevSlope(): number {
        return this._prevSlope
    }
    public set prevSlope(value: number) {
        this._prevSlope = value
    }

    /**
     * The previous data point, used to calculate current slope.
     */
    private _prevPoint: number
    public get prevPoint(): number {
        return this._prevPoint;
    }
    public set prevPoint(value: number) {
        this._prevPoint = value
    }

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
        this._prevPoint = 0
        this._prevSlope = 0
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
        debugStatic (SonificationLoggingLevel.DEBUG, `setting up subscription for ${this} ${sink$}`)
        super.setupSubscription(
            sink$.pipe(
                filter((val) => {
                    if (val instanceof Datum){
                        let slope = val.value - this.prevPoint
                        this.prevPoint = val.value // no matter what, we'll need the prev point to calculate the slope
                        if (this.direction == 0) {
                            console.log("direction 0")
                            if (Math.sign(slope) != Math.sign(this.prevSlope)) {
                                if (DEBUG) console.log('direction of slope changed')
                                this.prevSlope = slope
                                return true
                            }
                            return false
                        } else {
                            if (Math.sign(slope) == this.direction) {
                                if (Math.sign(slope) != Math.sign(this.prevSlope)) { 
                                    this.prevSlope=slope
                                    return true
                                }

                                this.prevSlope=slope
                                if (DEBUG) console.log("slope matching direction", this.direction)
                                return false
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
        return `SlopeParityHandler`
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
