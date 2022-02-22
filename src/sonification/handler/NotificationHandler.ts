import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DatumOutput } from '../output/DatumOutput'
import { DataHandler } from './DataHandler'
import { filter, Observable, tap } from 'rxjs'
import { OutputStateChange } from '../OutputConstants'

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

    public insideDomain(num: number) {
        return true
        /*
        console.log("checking if " + num + " is in " + this.interestPoints.toString())
        return this.interestPoints.includes(num)
        */
    }

    /**
     * Constructor
     *
     * @param sink. DataSink that is providing data to this Handler.
     * @param output. Optional output for this data
     * @param range [min, max]. Defaults to 0, 0 if not provided
     */
    constructor(output?: DatumOutput, range?: number[]) {
        super(output)
        if (range) this._interestPoints = range
        else this._interestPoints = [0]
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
                        return this.insideDomain(val.value)
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
        return `FilterRangeHandler: Keeping only data in ${this.interestPoints}`
    }
}
