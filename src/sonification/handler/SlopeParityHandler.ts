import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DatumOutput } from '../output/DatumOutput'
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

    /**
     * Constructor
     *
     * @param sink. DataSink that is providing data to this Handler.
     * @param output. Optional output for this data
     * @param range [min, max]. Defaults to 0, 0 if not provided
     */
    constructor(sink?: DataSink, output?: DatumOutput) {
        super(sink, output)
        this._prevPoint = 0
        this._prevSlope = 0
    }

    /**
     * Use datum to determine the current slope.
     * @param datum The datum to handle
     * @returns
     */
    handleDatum(datum?: Datum): boolean {
        if (!datum) return false
        let slope = datum.value - this.prevPoint
        this.prevPoint = datum.value // no matter what, we'll need the prev point to calculate the slope
        if (Math.sign(slope) != Math.sign(this.prevSlope)) {
            if (DEBUG) console.log('direction of slope changed')
            this.prevSlope = slope
            return super.handleDatum(datum)
        }
        return false
    }

    /**
     * @returns A string describing this class including its range.
     */
    public toString(): string {
        return `SlopeParityHandler`
    }
}
