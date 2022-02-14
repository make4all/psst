import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DatumOutput } from '../output/DatumOutput'
import { DataHandler } from './DataHandler'

const DEBUG = false

/**
 * A DataHandler that filters out things which are not betwen min and max (inclusive)
 * @todo change this to take a function that decides how to filter?
 */
export class FilterRangeHandler extends DataHandler {
    /**
     * The range to accept points within. Defaults to 0,0 if not defined in constructor
     */
    private _range: [number, number]
    public get range(): [number, number] {
        return this._range
    }
    public set range(value: [number, number]) {
        this._range = value
    }

    /**
     * Constructor
     *
     * @param sink. DataSink that is providing data to this Handler.
     * @param output. Optional output for this data
     * @param range [min, max]. Defaults to 0, 0 if not provided
     */
    constructor(sink?: DataSink, output?: DatumOutput, range?: [number, number]) {
        super(sink, output)
        if (range) this._range = range
        else this._range = [0, 0]
    }

    /**
     * Handle the next datum by filtering if it is not inside the range (inclusive)
     * @param datum The datum to handle
     * @returns
     */
    handleDatum(datum?: Datum): boolean {
        if (!datum) return false

        if (this.range[0] <= datum.value && datum.value <= this.range[1]) {
            if (DEBUG) console.log('in range. ')
            return super.handleDatum(datum)
        }
        if (DEBUG) console.log('not in range. ')
        return false
    }

    /**
     * @returns A string describing this class including its range.
     */
    public toString(): string {
        return `FilterRangeHandler: Keeping only data in ${this.range[0]},${this.range[1]}`
    }
}
