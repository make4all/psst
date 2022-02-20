import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DatumOutput } from '../output/DatumOutput'
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
    constructor(sink?: DataSink, output?: DatumOutput, direction?: number) {
        super(sink, output)
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
     * Update if datapoint is an extrema.
     * @param datum The datum to handle
     * @returns
     */
    handleDatum(datum?: Datum): boolean {
        if (!datum) return false
        if (this._direction == 1) {
            if (datum.value > this._extrema) {
                if (DEBUG) console.log("new maximum", datum.value)
                this._extrema = datum.value
                return super.handleDatum(datum)
            }
            return false
        } else {
            if (datum.value < this._extrema) {
                if (DEBUG) console.log("new minimum", datum.value)
                this._extrema = datum.value
                return super.handleDatum(datum)
            }
            return false
        }
    }

    /**
     * @returns A string describing this class including its range.
     */
    public toString(): string {
        return `RunningExtremaHandler`
    }
}
