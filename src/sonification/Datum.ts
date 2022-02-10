import { DatumOutput } from './output/DatumOutput'
import * as d3 from 'd3'

/**
 * The base interface for a data point. This is an interface because data points
 * may be used in other settings as well and we don't want to be too strict about what they are.
 *
 * All data points have certain properties and abilities, however
 * @field value The raw data value associated with this point
 * @field adjustedValue An adjusted value that may be assigned to a point for output.
 * @field previous The previous point in the sequence for this sink
 * @method toString() Returns a string describing this data point
 * @field sink The data sink this point is associated with [not sure if we need this pointer, but for completeness...]
 */

export class Datum {
    value: number
    sinkId: number
    time: number

    constructor(sinkId: number, value: number, time?: number) {
        this.value = value
        this.sinkId = sinkId
        if (time) this.time = time
        else this.time = d3.now()
    }

    public toString(): string {
        return `(raw: ${this.value}, ${this.time})`
    }
}
