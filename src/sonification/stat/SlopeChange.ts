import { buffer, bufferCount, map, Subscription } from 'rxjs'
import { Datum } from '../Datum'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'
import { Statistic } from './Statistic'

const DEBUG = false // true

/**
 * Returns 0 if the slopes have the same parity
 * -1 if the slopes switched from positive to negative
 * 1 if the slopes switched from negative to positive
 */
export class SlopeChange extends Statistic {
    /**
     * What buffer should the slope average be calculated over?
     */
    private slopeWindow = 3

    /**
     *
     * @param stream$ The stream of data over which to calculate the statistic
     * @param len The number of data points to calculate the running average over
     */
    constructor(stream$: Observable<OutputStateChange | Datum>, slopeWindow:number = 3) {
        super(0, stream$)
        this.slopeWindow = slopeWindow;
    }

    protected setupSubscription(stream$: Observable<number>): Subscription {
        // if (!this.slopeWindow) this.slopeWindow = 3
        // TODO: figure out why typescript thinks slopeWindow is undefined
        // TODO: and consider how to make window length possible to change without editing the code
        return super.setupSubscription(
            stream$.pipe(
                bufferCount(this.slopeWindow, 1),
                map((nums) => {
                    const max = Math.max(...nums)
                    const min = Math.min(...nums)
                    return max - min
                }),
                bufferCount(2, 0),
                map((slopes) => {
                    slopes[0] = slopes[0] >= 0 ? 1 : -1
                    slopes[1] = slopes[1] >= 0 ? 1 : -1
                    if (slopes[0] == slopes[1]) return 0
                    if (slopes[0] > slopes[1]) return -1
                    return 1
                }),
                debug(SonificationLoggingLevel.DEBUG, 'result', DEBUG),
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
