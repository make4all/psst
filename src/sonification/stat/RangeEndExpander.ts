import { distinctUntilChanged, filter, Observable, reduce, Subscription } from 'rxjs'
import { Datum } from '../Datum'
import { GrowthDirection, OutputStateChange } from '../OutputConstants'
import { Statistic } from './Statistic'

/**
 * Keeps track of the end of a range for a data set
 */
export class RangeEndExpander extends Statistic {
    direction: GrowthDirection

    /**
     * Set up a dynamic range end statistic.
     *
     * @param val the value to initialize the range with
     * @param direction Whether we are expanding on the minimum or maximum end of the range
     * @param stream$
     * @param startVal
     */
    constructor(direction: GrowthDirection, stream$: Observable<OutputStateChange | Datum>, val?: number) {
        super(val ? val : 0, stream$)
        this.direction = direction
    }

    /**
     * Uses reduce to decide whether to replace the value or not
     * and uniqueUntilChange to only send updates when there is a new value
     *
     * @param stream$ the stream of data
     * @returns a subscription
     */
    public setupSubscription(stream$: Observable<number>): Subscription {
        return super.setupSubscription(
            stream$.pipe(
                reduce((acc, curr) => {
                    if (this.direction == GrowthDirection.Min) {
                        return curr >= acc ? acc : curr
                    } else {
                        return curr <= acc ? acc : curr
                    }
                }),
                distinctUntilChanged(),
            ),
        )
    }
}
