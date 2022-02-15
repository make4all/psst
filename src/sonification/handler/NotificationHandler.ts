import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DatumOutput } from '../output/DatumOutput'
import { DataHandler } from './DataHandler'

const DEBUG = true

/**
 * A DataHandler that filters out things which are not betwen min and max (inclusive)
 * @todo change this to take a function that decides how to filter?
 */
export class NotificationHandler extends DataHandler {
    /**
     * The range to accept points within. Defaults to 0,0 if not defined in constructor
     */
    private _interestPoints: number[]
    public get interestPoints(): number[] {
        return this._interestPoints
    }
    public set interestPoints(value: number[]) {
        this._interestPoints = value
    }

    /**
     * Constructor
     *
     * @param sink. DataSink that is providing data to this Handler.
     * @param output. Optional output for this data
     * @param range [min, max]. Defaults to 0, 0 if not provided
     */
    constructor(sink?: DataSink, output?: DatumOutput, range?: number[]) {
        super(sink, output)
        if (range) this._interestPoints = range
        else this._interestPoints = [0]
    }

    /**
     * Handle the next datum by filtering if it is not inside the range (inclusive)
     * @param datum The datum to handle
     * @returns
     */
    handleDatum(datum?: Datum): boolean {
        if (!datum) return false

        if (this.interestPoints.includes(datum.value)) {
            if (DEBUG) console.log('of interest. ', datum.value)
            return super.handleDatum(datum)
        }
        if (DEBUG) console.log('not interesting. ')
        return false
    }

    /**
     * @returns A string describing this class including its range.
     */
    public toString(): string {
        return `FilterRangeHandler: Keeping only data in ${this.interestPoints}`
    }
}
