import { Datum } from '../Datum'
import { DisplayState } from '../SonificationConstants'

/**
 * Base class for calculating a statistic for a data stream.
 */
export interface Calculator {
    update(datum: Datum, stat: number): number
}
