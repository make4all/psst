import { bufferCount, map, Observable, Subscription } from 'rxjs'
import { Datum } from '../Datum'
import { OutputStateChange } from '../OutputConstants'
import { Statistic } from './Statistic'

/**
 * Keeps track of the slope between the most recent two points in the data.
 */
export class Slope extends Statistic {

    /**
     * Set up a slope statistic.
     *
     * @param val the value to initialize the slope with
     * @param stream$
     */
    constructor(val?: number, stream$?: Observable<OutputStateChange | Datum>) {
        super(val ? val : 0, stream$)
    }

    /**
     *
     * @param stream$ the stream of data
     * @returns a subscription
     */
    public setupSubscription(stream$: Observable<number>): Subscription {
        return super.setupSubscription(
            stream$.pipe(
              bufferCount(2,1),
              map((frames) => {
                  return frames[1] - frames[0]
              }),
            ),
        )
    }
}
