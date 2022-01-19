import { DataSource } from '../DataSource'
import { Datum } from '../Datum'
import { Template } from './Template'
import * as d3 from 'd3'
import { HourglassDisabledSharp } from '@mui/icons-material'
import { DatumDisplay } from '../displays/DatumDisplay'

export enum ExceedRangeResponse {
    Expand,
    Ignore,
    Error,
}

/**
 * A template that scales the given value based on a specified min and max
 *
 * Scaling depends on also knowing the range of the data being provided. This template
 * takes as input an expected range, and a boolean value that specifies whether it should
 * (10 expand the range (2) throw an error or (3) cap the range if data appears that is not within range.
 */
export class ScaleTemplate extends Template {
    /**
     * The range that numbers should be scaled to (in order of min, max)
     */
    targetRange: [number, number]
    /**
     * The range that numbers are expected to come from (in order of min, max)
     */
    sourceRange: [number, number]

    /**
     * What to do if the range is exceeded (a number is too small or too large for the sourceRange)
     */
    exceedRange: ExceedRangeResponse

    /**
     * Sats up ranges for calculation. Ensures that min and max are not equal.
     *
     * @param display An optional display for the template
     * @param targetRange The minimum and maximum of the target range (the adjusted data range). Min and Max must not be the same. Defaults to [0,1]
     * @param sourceRange The minimum and maximum of the source range (the data coming in). Min and Max must not be the same. Defaults to [0,1]
     * @param exceedRange What should happen if a datum is outside of the sourceRange. Defaults to Ignore.
     */
    constructor(
        display?: DatumDisplay,
        targetRange: [number, number] = [0, 1],
        sourceRange: [number, number] = [0, 1],
        exceedRange = ExceedRangeResponse.Ignore,
    ) {
        super(display)
        this.targetRange = targetRange
        this.sourceRange = sourceRange
        if (sourceRange[0] == sourceRange[1]) sourceRange[1] += 1
        if (targetRange[0] == targetRange[1]) targetRange[1] += 1
        this.exceedRange = exceedRange
    }

    /**
     * Adjusts the value for datum by scaling it to the range [min, max]
     *
     * @param datum
     * @param source
     * @returns Always returns true
     */
    handleDatum(datum: Datum, source: DataSource): boolean {
        let sourcemax = source.getStat('max')
        let sourcemin = source.getStat('min')

        if (sourcemax > this.sourceRange[1]) {
            if (this.exceedRange == ExceedRangeResponse.Error) {
                throw new Error(`Datum ${datum} value ${datum.value}  exceeded expected maximum ${this.sourceRange[1]}`)
            } else if (this.exceedRange == ExceedRangeResponse.Expand) {
                this.sourceRange[1] = datum.value
            }
        }
        if (sourcemin > this.sourceRange[0]) {
            if (this.exceedRange == ExceedRangeResponse.Error) {
                throw new Error(`Datum ${datum} value ${datum.value}  exceeded expected minimum ${this.sourceRange[0]}`)
            } else if (this.exceedRange == ExceedRangeResponse.Expand) {
                this.sourceRange[1] = datum.value
            }
        }

        datum.adjustedValue = d3.scaleLinear().domain(this.sourceRange).range(this.targetRange)(datum.value)
        super.handleDatum(datum, source)
        return true
    }

    public toString(): string {
        return `ScaleTemplate: Converting to ${this.targetRange[0]},${this.targetRange[1]}`
    }
}
