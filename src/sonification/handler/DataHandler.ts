import { DatumOutput } from '../output/DatumOutput'
import { filter, Observable, Subject, tap } from 'rxjs'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from '../OutputConstants'

const DEBUG = false

/**
 * A DataHandler class is used to decide how to output each data point.
 */
export abstract class DataHandler extends Subject<OutputStateChange | Datum> {
    // TODO: right now has to be provided at construction time. Change?
    private output: DatumOutput | undefined
    private outputSubscription

    /**
     * Set up a subscription so we are notified about events
     * Override this if the data needs to be modified in some way
     *
     * @param sink The sink that is producing data for us
     */
    public setupSubscription(sink$: Observable<OutputStateChange | Datum>) {
        debugStatic(SonificationLoggingLevel.DEBUG, 'setting up subscription for sink')
        sink$.pipe(debug(SonificationLoggingLevel.DEBUG, 'DataHandler', DEBUG)).subscribe(this)
        if (this.output) this.setupOutputSubscription(this.output, sink$)
    }

    /**
     * Call output.setupSubscription, possibly modify stream before sending to output.
     *
     * @param output The output object
     */
    setupOutputSubscription(output: DatumOutput, stream$: Observable<OutputStateChange | Datum>) {
        let outputStream$ = stream$.pipe(
            filter((val) => val != undefined),
            debug(SonificationLoggingLevel.DEBUG, `Output val`, true),
        )
        debugStatic(SonificationLoggingLevel.DEBUG, 'setting up output')
        this.outputSubscription = output.setupSubscription(outputStream$ as Observable<OutputStateChange | Datum>)
    }
    public toString(): string {
        return `DataHandler ${this}`
    }

    /**
     * @param output An optional way to output the data
     */
    constructor(output?: DatumOutput) {
        super()
        this.output = output
    }
}

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
import { Datum } from '../Datum'
const debug = (level: number, message: string, watch: boolean) => (source: Observable<any>) => {
    if (watch) {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + (val instanceof Datum) ? val : OutputStateChange[val])
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
