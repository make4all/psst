import { bufferCount, map, Subscription } from 'rxjs'
import { Datum } from '../Datum'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'
import { Statistic } from './Statistic'

const DEBUG = false // true

/**
 * Returns 0 if the slopes have the same parity
 * -1 if the slopes switched from positive to negative
 * 1 if the slopes switched from negative to positive
 */
export class Slope extends Statistic {
    /**
     * What buffer should the slope average be calculated over?
     */
    private slopeWindow = 3

    /**
     *
     * @param stream$ The stream of data over which to calculate the statistic
     * @param len The number of data points to calculate the running average over
     */
    constructor(stream$: Observable<OutputStateChange | Datum>) {
        super(0, stream$)
    }

    protected setupSubscription(stream$: Observable<number>): Subscription {
        if (!this.slopeWindow) this.slopeWindow = 3
        // TODO: figure out why typescript thinks slopeWindow is undefined
        // TODO: and consider how to make window length possible to change without editing the cod

        return super.setupSubscription(
            stream$.pipe(
                bufferCount(this.slopeWindow, 1),
                map((nums) => {
                    const max = Math.max(...nums)
                    const min = Math.min(...nums)
                    return max - min
                }),
            ),
        )
    }
}

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
import { Observable, tap } from 'rxjs'

const debug = (level: number, message: string, watch: boolean) => (source: Observable<any>) => {
    if (watch) {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + val)
            }),
            tag(message),
        )
    } else {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + val)
            }),
        )
    }
}

const debugStatic = (level: number, message: string) => {
    if (DEBUG) {
        if (level >= getSonificationLoggingLevel()) {
            console.log(message)
        } else console.log('debug message dumped')
    }
}
