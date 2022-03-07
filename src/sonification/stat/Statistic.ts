import { BehaviorSubject, filter, map, Observable, of, Subscription } from 'rxjs'
import { Datum } from '../Datum'
import { OutputStateChange } from '../OutputConstants'

/**
 * Base class for calculating a statistic for a data stream.
 *
 * @todo should stats watch StateDatum streams or num streams?
 *
 * Stores the last  value of the statistic
 */
export class Statistic extends BehaviorSubject<number> {
    constructor(value: number, stream$?: Observable<OutputStateChange | Datum>) {
        super(value)
        if (stream$) {
            this.setupSubscription(
                stream$.pipe(
                    filter((val) => val instanceof Datum),
                    map((val) => {
                        let datum = val as Datum
                        return datum.value
                    }),
                ),
            )
        } else {
            let singlePoint$ = of(value)
            //let singleState$ = of(OutputState.Undefined)
            //combineLatest({ state: singleState$, datum: singlePoint$ })
            this.setupSubscription(singlePoint$)
        }
    }

    subscription?: Subscription

    /**
     * Sets up a subscription that only updates when new values come in
     *
     * @param stream$ The data being streamed
     */
    public setupSubscription(stream$: Observable<number>): Subscription {
        this.subscription?.unsubscribe()
        this.subscription = stream$.subscribe(this)
        return this.subscription
    }

    public toString() {
        return `${this.value}$`
    }
}
