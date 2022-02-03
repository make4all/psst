import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DataHandler } from './DataHandler'
import * as d3 from 'd3'
import { HourglassDisabledSharp } from '@mui/icons-material'
import { DatumOutput } from '../output/DatumOutput'

export enum ExceedDomainResponse {
    Expand,
    Ignore,
    Error,
}

/**
 * A DataHandler that scales the given value based on a specified min and max
 *
 * Scaling depends on also knowing the range of the data being provided. This DataHandler
 * takes as input an expected range, and a boolean value that specifies whether it should
 * (10 expand the range (2) throw an error or (3) cap the range if data appears that is not within range.
 */
export class ScaleHandler extends DataHandler {
    /**
     * The range that numbers should be scaled to (in order of min, max)
     */
    range: [number, number]
    /**
     * The range that numbers are expected to come from (in order of min, max)
     */
    domain: [number, number]

    /**
     * What to do if the range is exceeded (a number is too small or too large for the domain)
     */
    exceedDomain: ExceedDomainResponse

    /**
     * Converts from domain to target range.
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
     * @param output Optional way to create output for the DataHandler
     * @param exceedRange What should happen if a datum is outside of the domain. Defaults to Ignore.
     * @param targetRange The minimum and maximum of the target range (the adjusted data range). Defaults to [0,1]
     * @param domain The minimum and maximum of the domain (the range of the data coming in).  Defaults to [0,1]
     * @param conversionFunction defaults to a linear mapping.
     */
    constructor(
        sink?: DataSink,
        output?: DatumOutput,
        exceedDomain?: ExceedDomainResponse,
        targetRange?: [number, number],
        domain: [number, number] = [0, 1],
        conversionFunction?: (datum: Datum) => number,
    ) {
        super(sink, output)
        this.range = targetRange ? targetRange : [0, 1]
        this.domain = domain ? domain : [0, 1]
        this.exceedDomain = exceedDomain ? exceedDomain : ExceedDomainResponse.Expand
        this._conversionFunction = conversionFunction
            ? conversionFunction
            : (datum: Datum, domain, range) => {
                  return d3.scaleLinear().domain(domain).range(range)(datum.value)
              }
    }

    /**
     * Adjusts the value for datum by scaling it to the range [min, max]
     * Alternatively, if datum is empty, no need to adjust since the stream is empty
     * at this point in time.
     *
     * @param datum
     * @returns Always returns true
     */
    handleDatum(datum?: Datum): boolean {
        if (!datum) return true

        let sinkMax = this.domain[0]
        let sinkMin = this.domain[1]
        if (this.sink) {
            console.log('getting max and min')
            sinkMax = this.sink.getStat('max')
            sinkMin = this.sink.getStat('min')
        }

        if (this.exceedDomain == ExceedDomainResponse.Error && (sinkMax > this.domain[1] || sinkMin < this.domain[0]))
            throw new Error(
                `Datum ${datum} value ${datum.value} outside of range  [${this.domain[0]},${this.domain[1]}]`,
            )
        else if (this.exceedDomain == ExceedDomainResponse.Expand) {
            if (sinkMin < this.domain[0]) this.domain[0] = sinkMin
            if (sinkMax > this.domain[1]) this.domain[1] = sinkMax
        }

        datum.adjustedValue = this.conversionFunction(datum, this.domain, this.range)
        return super.handleDatum(datum)
    }

    public toString(): string {
        return `ScaleHandler: Converting from ${this.domain[0]}, ${this.domain[1]} to ${this.range[0]},${this.range[1]}`
    }
}
