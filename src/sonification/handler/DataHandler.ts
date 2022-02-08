import { DataSink } from '../DataSink'
import { DatumOutput } from '../output/DatumOutput'
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, tap } from 'rxjs'
import {
    getSonificationLoggingLevel,
    NullableDatum,
    OutputStateChange,
    SonificationLoggingLevel,
} from '../OutputConstants'

/**
 * A DataHandler class is used to decide how to output each data point.
 */
export abstract class DataHandler extends BehaviorSubject<[OutputStateChange, NullableDatum]> {
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
        let outputStream$ = this.pipe(
            filter(([state, datum]) => state == OutputStateChange.Play && !datum),
            map(([state, datum]) => datum),
        ).pipe(debug(SonificationLoggingLevel.DEBUG, `outputing datum to output ${output}`))
        output.setupSubscription(outputStream$ as DataHandler)

        this.updateOutputAboutState(output)
    }

    /**
     * Set up a subscription so we are notified about events
     * Override this if the data needs to be modified in some way
     *
     * @param sink The sink that is producing data for us
     */
    public setupSubscription(sink$: DataSink) {
        console.log(`setting up subscription for ${this} ${sink$}`)
        sink$
            .pipe(debug(SonificationLoggingLevel.DEBUG, `Sink notifying data handler about events ${this}`))
            .subscribe(this)
    }

    /**
     * Notify output about updates about the current output state
     */
    protected updateOutputAboutState(output: DatumOutput) {
        let stateStream$ = this.pipe(
            map(([state, datum]) => {
                return state
            }),
        )
        stateStream$ = stateStream$.pipe(distinctUntilChanged())
        stateStream$.pipe(debug(SonificationLoggingLevel.DEBUG, `outputing state to output ${output}`)).subscribe({
            next: (state) => output.setOutputState(state),
        })
    }

    /**
     * @param output An optional way to output the data
     */
    constructor(output?: DatumOutput) {
        super([OutputStateChange.Undefined, undefined])
        this.outputs = new Array<DatumOutput>()
        if (output) this.addOutput(output)
    }

    public toString(): string {
        return `DataHandler ${this}`
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
