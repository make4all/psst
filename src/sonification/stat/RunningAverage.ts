import { bufferCount, map, Observable, Subscription } from 'rxjs'
import { Datum } from '../Datum'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'
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
   debugStatic(SonificationLoggingLevel.DEBUG, `initializing RunningAverage with ${this.buffer}` ) 
    }

    protected setupSubscription(stream$: Observable<number>): Subscription {
        return super.setupSubscription(
            stream$.pipe(
                bufferCount(this.buffer,1),
                map((nums) => {
                    const total = nums.reduce((acc, curr) => {
                        acc += curr
                        return acc
                    },0 )
                    debugStatic(SonificationLoggingLevel.DEBUG,`returning ${1 / (total / nums.length)}`)
                    return 1 / (total / nums.length)
                }),
            ),
        )
    }
}


//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
import {tap } from 'rxjs'

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