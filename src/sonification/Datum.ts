import { DataSource } from './DataSource';
import { DatumDisplay } from './displays/DatumDisplay';
import * as d3 from 'd3'


/**
 * The base interface for a data point. This is an interface because data points
 * may be used in other settings as well and we don't want to be too strict about what they are.
 *
 * All data points have certain properties and abilities, however
 * @field value The raw data value associated with this point
 * @field adjustedValue An adjusted value that may be assigned to a point for display.
 * @field previous The previous point in the sequence for this source
 * @method toString() Returns a string describing this data point
 * @field source The data source this point is associated with [not sure if we need this pointer, but for completeness...]
 */

export class Datum {
    value: number;
    adjustedValue: number;
    sourceId: number;
    displays: Array<DatumDisplay>;
    time: number;

    constructor(sourceId: number, value: number ) {
        this.value = value;
        this.adjustedValue = value;
        this.sourceId = sourceId;
        this.displays = [];
        this.time = d3.now();
    }

    public toString(): string {
        return `(raw: ${this.value}; adjusted: ${this.adjustedValue}, ${this.time})`;
    }    
}
