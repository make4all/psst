import { List } from '@mui/material'
import { Datum } from '../Datum'
import { Calculator } from './Calculator'

/**
 * Calculates a running average based on the last n values seen.
 */
class RunningAverage implements Calculator {
    /**
     * How many points should be kept to calculate this running average?
     */
    private _k = 3
    public get k() {
        return this._k
    }
    public set k(value) {
        this._k = value
    }

    private data = Datum[this._k]

    constructor(k?: number) {
        if (k) {
            this.k = k
            this.data = Datum[k]
        }
    }

    /**
     * Update the running average statistic
     * @param datum The new data point
     * @param stat The current running average
     * @returns The new running average
     */
    public update(datum: Datum, stat: number): number {
        this.data.push(datum)
        let dNk = this.data.shift()

        return stat + (1 / this.k) * (datum.value - dNk.value)
    }
}
