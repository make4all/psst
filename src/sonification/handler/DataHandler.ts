import { DataSink } from '../DataSink'
import { DatumOutput } from '../output/DatumOutput'
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, Observer, Subject, tap } from 'rxjs'
import {
    getSonificationLoggingLevel,
    NullableDatum,
    OutputStateChange,
    SonificationLoggingLevel,
} from '../OutputConstants'

/**
 * A DataHandler class is used to decide how to output each data point.
 */
export abstract class DataHandler extends Subject<[OutputStateChange, NullableDatum]> {
    /**
     * Store a DatumOutput if this DataHandler has one
     */
    public outputs: Array<DatumOutput>

    /**
     * Add an output and make sure it has the right subscriptions
     *
     * @param output The output to add
     */
    public addOutput(output: DatumOutput) {
        this.outputs.push(output)
        this.setupOutputSubscription(output)
    }

    /**
     * Set up a subscription so we are notified about events
     * Override this if the data needs to be modified in some way
     *
     * @param sink The sink that is producing data for us
     */
    public setupSubscription(sink$: Observable<[OutputStateChange, Datum]>) {
        sink$.pipe(debug(SonificationLoggingLevel.DEBUG, 'DataHandler', true)).subscribe(this)
    }

    /**
     * Call output.setupSubscription, possibly modify stream before sending to output.
     *
     * @param output The output object
     */
    setupOutputSubscription(output: DatumOutput) {
        let outputStream$ = this.pipe(filter(([state, datum]) => datum != undefined))
        debugStatic(SonificationLoggingLevel.DEBUG, 'setting up output')
        output.setupSubscription(outputStream$ as Observable<[OutputStateChange, Datum]>)
    }

    /**
     * @param output An optional way to output the data
     */
    constructor(output?: DatumOutput) {
        super()
        this.outputs = new Array<DatumOutput>()
        if (output) this.addOutput(output)
    }

    public toString(): string {
        return `DataHandler ${this}`
    }
}

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'
import { Datum } from '../Datum'
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
