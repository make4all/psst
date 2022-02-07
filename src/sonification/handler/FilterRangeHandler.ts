import { filter, Observable, tap } from 'rxjs'
import { DataSink } from '../DataSink'
import { DatumOutput } from '../output/DatumOutput'
import { getSonificationLoggingLevel, SonificationLoggingLevel } from '../OutputConstants'
import { DataHandler } from './DataHandler'

/**
 * A DataHandler that filters out things which are not betwen min and max (inclusive)
 * @todo change this to take a function that decides how to filter?
 */
export class FilterRangeHandler extends DataHandler {
    /**
     * The domain to accept points within. Defaults to 0,0 if not defined in constructor
     */
    private _domain: [number, number]
    public get domain(): [number, number] {
        return this.domain
    }
    public set domain(value: [number, number]) {
        this.domain = value
    }
    public insideDomain(num: number): boolean {
        return num >= this.domain[0] && num <= this.domain[1]
    }

    /**
     * Constructor
     *
     * @param sink. DataSink that is providing data to this Handler.
     * @param output. Optional output for this data
     * @param domain [min, max]. Defaults to 0, 0 if not provided
     */
    constructor(output?: DatumOutput, domain?: [number, number]) {
        super(output)
        if (domain) this._domain = domain
        else this._domain = [0, 0]
    }

    /**
     * Set up a subscription so we are notified about events
     * Override this if the data needs to be modified in some way
     *
     * @param sink The sink that is producing data for us
     */
    public setupSubscription(sink$: DataSink) {
        sink$
            .pipe(
                filter((state, num) => {
                    return this.insideDomain(num)
                }),
            )
            .pipe(debug(SonificationLoggingLevel.DEBUG, `Notifying handler about event ${this}`))
            .subscribe(this)
    }

    /**
     * @returns A string describing this class including its range.
     */
    public toString(): string {
        return `FilterRangeHandler: Keeping only data in ${this.domain[0]},${this.domain[1]}`
    }
}

const debug = (level: number, message: string) => (source: Observable<any>) =>
    source.pipe(
        tap((val) => {
            debugStatic(level, message + ': ' + val)
        }),
    )
const debugStatic = (level: number, message: string) => {
    if (level >= getSonificationLoggingLevel()) {
        console.log(message)
    } //else console.log('debug message dumped')
}
