import { bufferCount, combineLatest, map, mergeMap, Observable, reduce, Subscription, take, windowCount } from 'rxjs'
import { Datum } from '../Datum'
import { OutputStateChange } from '../OutputConstants'
import { Statistic } from './Statistic'

/**
 * Calculates a running average based on the last n values seen.
 */
export class SlopeChange extends Statistic {
    /**
     * What buffer should the slope average be calculated over?
     */
    buffer = 3

    /**
     *
     * @param stream$ The stream of data over which to calculate the statistic
     * @param len The number of data points to calculate the running average over
     */
    constructor(len: number, stream$: Observable<OutputStateChange | Datum>) {
        super(0, stream$)
        this.buffer = len ? len : this.buffer
    }

    protected setupSubscription(stream$: Observable<number>): Subscription {
        let windows$ = stream$.pipe(windowCount(this.buffer))
        return super.setupSubscription(
            windows$.pipe(
                bufferCount(2),
                mergeMap((frames) => {
                    const total1$ = frames[0].pipe(
                        reduce((acc, curr) => {
                            acc += curr
                            return acc
                        }, 0),
                        take(1),
                    )
                    const total2$ = frames[1].pipe(
                        reduce((acc, curr) => {
                            acc += curr
                            return acc
                        }, 0),
                        take(1),
                    )
                    return combineLatest([total1$, total2$]).pipe(
                        map((totals) => {
                            const diff = 1 / (totals[0] / this.buffer) - 1 / (totals[1] / this.buffer)
                            return diff > 0 ? 1 : diff == 0 ? 0 : -1
                        }),
                    )
                }),
            ),
        )
    }
}
