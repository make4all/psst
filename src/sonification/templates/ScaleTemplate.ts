import { DataSource } from '../DataSource'
import { Datum } from '../Datum'
import { Template } from './Template'
import * as d3 from 'd3'
import { HourglassDisabledSharp } from '@mui/icons-material'
import { DatumDisplay } from '../displays/DatumDisplay'

export enum ExceedDomainResponse {
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
    range: [number, number]
    /**
     * The range that numbers are expected to come from (in order of min, max)
     */
    domain: [number, number]

    /**
     * What to do if the range is exceeded (a number is too small or too large for the sourceRange)
     */
    exceedDomain: ExceedDomainResponse

    /**
     * Converts from source range to target range.
     */
    private _conversionFunction: (datum: Datum, domain: [number, number], range: [number, number]) => number
    protected get conversionFunction(): (datum: Datum, domain: [number, number], range: [number, number]) => number {
        return this._conversionFunction
    }
    protected set conversionFunction(
        value: (datum: Datum, domain: [number, number], range: [number, number]) => number,
    ) {
        this._conversionFunction = value
    }

    /**
     * Sats up ranges for calculation. Ensures that min and max are not equal.
     *
     * @todo need to debug/ensure that exceedDomain is correctly processed in constructor & write test for this...
     *
     * @param display An optional display for the template
     * @param exceedRange What should happen if a datum is outside of the sourceRange. Defaults to Ignore.
     * @param targetRange The minimum and maximum of the target range (the adjusted data range). Defaults to [0,1]
     * @param sourceRange The minimum and maximum of the source range (the data coming in).  Defaults to [0,1]
     * @param conversionFunction defaults to a linear mapping.
     */
    constructor(
        display?: DatumDisplay,
        exceedDomain?: ExceedDomainResponse,
        targetRange?: [number, number],
        sourceRange: [number, number] = [0, 1],
        conversionFunction?: (datum: Datum) => number,
    ) {
        super(display)
        this.range = targetRange ? targetRange : [0, 1]
        this.domain = sourceRange ? sourceRange : [0, 1]
        this.exceedDomain = exceedDomain ? exceedDomain : ExceedDomainResponse.Expand
        this._conversionFunction = conversionFunction
            ? conversionFunction
            : (datum: Datum, domain, range) => {
                  return d3.scaleLinear().domain(domain).range(range)(datum.value)
              }
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

        if (
            this.exceedDomain == ExceedDomainResponse.Error &&
            (sourcemax > this.domain[1] || sourcemin < this.domain[0])
        )
            throw new Error(
                `Datum ${datum} value ${datum.value} outside of range  [${this.domain[0]},${this.domain[1]}]`,
            )
        else if (this.exceedDomain == ExceedDomainResponse.Expand) {
            console.log('checking for expansion')
            if (sourcemin < this.domain[0]) this.domain[0] = sourcemin
            if (sourcemax > this.domain[1]) this.domain[1] = sourcemax
        }

        console.log(
            `response = ${this.exceedDomain} vs ${ExceedDomainResponse.Expand}; sourcemaxmin = ${sourcemax}, ${sourcemin}; Range: ${this.range} Domain: ${this.domain} Datum: ${datum.value}`,
        )
        datum.adjustedValue = this.conversionFunction(datum, this.domain, this.range)
        console.log(`new value ${datum.adjustedValue}`)
        super.handleDatum(datum, source)
        return true
    }

    public toString(): string {
        return `ScaleTemplate: Converting to ${this.range[0]},${this.range[1]}`
    }
}
