import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DatumOutput } from '../output/DatumOutput'
import { DataHandler } from './DataHandler'
import { filter, Observable, tap } from 'rxjs'
import { OutputStateChange } from '../OutputConstants'

const DEBUG = true

/**
 * A DataHandler that  notifies if a set of point/s are seen
  */
export class NotificationHandler extends DataHandler {
    /**
     * A set of points to be notified about. defaults to 0 if not specified in the constructor.
     */
    private _interestPoints: number[]
    public get interestPoints(): number[] {
        return this._interestPoints
    }
    public set interestPoints(value: number[]) {
        this._interestPoints = value
    }

    /**
     * checks if a given point is in the points of interest.
     * @param num 
     * @returns true if a point is in the points of interest, else returns false.
     */
    public isInterestPoint(num: number) {
        // return true
        
        console.log("checking if " + num + " is in " + this.interestPoints.toString())
        return this.interestPoints.includes(num)
        
    }

    /**
     * Constructor
     *
     * @param sink. DataSink that is providing data to this Handler.
     * @param output. Optional output for this data
     * @param interestPoints [number[]. Defaults to 0 if not provided
     */
    constructor(output?: DatumOutput, interestPoints?: number[]) {
        super(output)
        if (interestPoints) this._interestPoints = interestPoints
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
                        return this.isInterestPoint(val.value)
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
        return `NotificationHandler: notifying only if points are  in ${this.interestPoints}`
    }
}
