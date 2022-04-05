import { bufferCount, map, Observable, Subscription } from 'rxjs'
import { Datum } from '../Datum'
import { OutputStateChange } from '../OutputConstants'
import { Statistic } from './Statistic'
const DEBUG:boolean = true
/**
 * Calculates a running average based on the last n values seen.
 */
export class RunningAverage extends Statistic {
    /**
     * What buffer should the average be calculated over?
     */
    buffer:number = 3

    /**
     *
     * @param stream$ The stream of data over which to calculate the statistic
     * @param len The number of data points to calculate the running average over
     */
    constructor(stream$: Observable<OutputStateChange | Datum>,len?: number) {
        super(0, stream$)
        this.buffer = len ? len : this.buffer
  if(DEBUG) console.log("running average initialized with buffer size",this.buffer) 
    }

    protected setupSubscription(stream$: Observable<number>): Subscription {
        return super.setupSubscription(
            stream$.pipe(
                bufferCount(this.buffer),
                map((nums) => {
                    const total = nums.reduce((acc, curr) => {
                        acc += curr
                        return acc
                    },0 )
                    return 1 / (total / nums.length)
                }),
            ),
        )
    }
}
