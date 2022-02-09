import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DataHandler } from './DataHandler'
import { DatumOutput } from '../output/DatumOutput'
import { map, combineLatest, Observable, tap, filter, Subject } from 'rxjs'
import { Statistic } from '../stat/Statistic'
import { getSonificationLoggingLevel, GrowthDirection, SonificationLoggingLevel } from '../OutputConstants'
import { RangeEndExpander } from '../stat/RangeEndExpander'
import assert from 'assert'

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
    range: [Statistic, Statistic]
    /**
     * The range that numbers are expected to come from (in order of min, max)
     */
    domain: [Statistic, Statistic]

    /**
     * Converts from domain to target range.
     */
    private _conversionFunction: (value: number, domain: [number, number], range: [number, number]) => number
    protected get conversionFunction(): (value: number, domain: [number, number], range: [number, number]) => number {
        return this._conversionFunction
    }
    protected set conversionFunction(
        value: (value: number, domain: [number, number], range: [number, number]) => number,
    ) {
        this._conversionFunction = value
    }

    /**
     * Sets up ranges for calculation. Will use expanding ranges based on stream if nothing is specified.
     * @todo need to debug/ensure that exceedDomain is correctly processed in constructor & write test for this...
     *
     * @param conversionFunction defaults to a linear mapping.
     * @param domain  The minimum and maximum of the domain (the range of the data coming in).
     * @param targetRange The minimum and maximum of the target range (the adjusted data range).
     * @param output
     */
    constructor(
        conversionFunction?: (value: number, domain: [number, number], range: [number, number]) => number,
        domain?: [number, number],
        targetRange?: [number, number],
        output?: DatumOutput,
    ) {
        super(output)

        if (conversionFunction) this._conversionFunction = conversionFunction
        else {
            this._conversionFunction = (num: number, domain: [number, number], range: [number, number]) => {
                let res = ((num - domain[0]) * (range[1] - range[0])) / (domain[1] - domain[0]) + range[0]
                return (res = NaN) ? 0 : res
            }
        }

        if (domain) {
            assert(domain[0] < domain[1], 'Domain should be in order of min, max')
            // add a stat for the min
            this.domain = [new Statistic(domain[0]), new Statistic(domain[1])]
        } else {
            this.domain = [
                new RangeEndExpander(GrowthDirection.Min, this, 0),
                new RangeEndExpander(GrowthDirection.Max, this, 1),
            ]
        }

        if (targetRange) {
            assert(targetRange[0] < targetRange[1], 'range should be in order of min, max')
            this.range = [new Statistic(targetRange[0]), new Statistic(targetRange[1])]
        } else {
            this.range = [
                new RangeEndExpander(GrowthDirection.Min, this, 0),
                new RangeEndExpander(GrowthDirection.Max, this, 1),
            ]
        }
    }

    /**
     * Subcribes to a modified version the sink which replaces the original datum with a scaled datum
     *
     * @param sink$ The data comes from here
     */
    public setupSubscription(sink$: DataSink): void {
        super.setupSubscription(
            sink$.pipe(
                debug(SonificationLoggingLevel.DEBUG, 'scaling', false),
                filter(([state, datum]) => datum != undefined),
                //debug(SonificationLoggingLevel.DEBUG, 'scaling', false),
                map(([state, datum]) => {
                    console.log('setting up new datum')
                    datum = new Datum(
                        datum.sinkId,
                        this.conversionFunction(
                            datum.value,
                            [this.domain[0].value, this.domain[1].value],
                            [this.range[0].value, this.range[1].value],
                        ),
                        datum.time,
                    )
                    console.log('set up new datum')
                    return [state, datum]
                }),
                debug(SonificationLoggingLevel.DEBUG, 'scaled', false),
            ) as DataSink,
        )
    }

    public toString(): string {
        return `ScaleHandler: Converting from ${this.domain[0]}, ${this.domain[1]} to ${this.range[0]},${this.range[1]}`
    }
}

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
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
    if (level >= getSonificationLoggingLevel()) {
        console.log(message)
    } else console.log('debug message dumped')
}
