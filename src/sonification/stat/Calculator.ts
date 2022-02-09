import { Datum } from '../Datum'
import { OutputState } from '../OutputConstants'

/**
 * Base class for calculating a statistic for a data stream.
 */
export interface Calculator {
    update(datum: Datum, stat: number): number
}
