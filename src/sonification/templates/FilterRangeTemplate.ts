import { DataSource } from '../DataSource'
import { Datum } from '../Datum'
import { DatumDisplay } from '../displays/DatumDisplay'
import { Template } from './Template'

/**
 * A template that filters out things which are not betwen min and max (inclusive)
 * @todo change this to take a function that decides how to filter?
 */
export class FilterRangeTemplate extends Template {
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
     * @param display. Optional display for this data
     * @param range [min, max]. Defaults to 0, 0 if not provided
     */
    constructor(source?: DataSource, display?: DatumDisplay, range?: [number, number]) {
        super(source, display)
        if (range) this._range = range
        else this._range = [0, 0]
    }

    /**
     * Handle the next datum by filtering if it is not inside the range (inclusive)
     * @param datum The datum to handle
     * @param source The DataSource
     * @returns
     */
    handleDatum(datum?: Datum): boolean {
        if (!datum) return false

        if (this.range[0] <= datum.value && datum.value <= this.range[1]) {
            console.log('in range. ')
            return super.handleDatum(datum)
        }
        console.log('not in range. ')
        return false
    }

    /**
     * @returns A string describing this class including its range.
     */
    public toString(): string {
        return `FilterRangeTemplate: Keeping only data in ${this.range[0]},${this.range[1]}`
    }
}
