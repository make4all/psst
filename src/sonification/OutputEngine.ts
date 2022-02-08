import { Datum } from './Datum'
import {
    getSonificationLoggingLevel,
    NullableDatum,
    OutputStateChange,
    SonificationLoggingLevel,
} from './OutputConstants'
import { DataSink } from './DataSink'
import { BehaviorSubject, distinctUntilChanged, lastValueFrom, map, Observable, share, tap, zip } from 'rxjs'
import assert from 'assert'

/**
 * OutputEngine class
 * Has a single instance
 * Users of our library get an instance of this to control it i.e. get sink, play, etc.
 */
export class OutputEngine extends BehaviorSubject<OutputStateChange> {
    /**
     * The Output Engine. Enforce that there is only ever one.
     * @todo ask group if there is a better way to enforce this.
     */
    private static outputEngineInstance: OutputEngine

    /**
     * A map of Data sinks handled by the Output Engine.
     */
    private sinks: Map<
        number,
        {
            sink: DataSink
            stream$: Observable<[OutputStateChange, Datum]> | undefined
        }
    >

    /**
     * @returns A dataSink Id that is unique
     */
    public getUniqueId(): number {
        let newId = 0
        this.sinks.forEach((value, key) => {
            newId = key > newId ? key : newId
        })
        return newId + 1
    }

    /**
     * Get a sink given an Id. Throws an error of sinkId doesn't exist.
     * @param sinkId
     * @returns Returns the DataSink associated with sinkId.
     */
    public getSink(sinkId: number): DataSink {
        let sink = this.sinks.get(sinkId)?.sink
        assert(sink, `no sink associated with ${sinkId}`)
        return sink
    }

    /**
     * AddSink takes optional arguments, and based on what is provided either constructs
     * a new data sink or uses a given one. In either case, it adds it to the set of sinks.
     *
     * @param description A description for the sink
     * @param sinkId A unique id for the sink
     * @param sink The DataSink object
     */
    public addSink(description?: string, sinkId?: number, sink?: DataSink, stream$?: Observable<Datum>): DataSink {
        description = description ? description : 'Unknown Sink'
        sinkId = sink ? sink.id : sinkId
        if (!sinkId) sinkId = this.getUniqueId()
        assert(!this.sinks.has(sinkId), 'sinkId is not unique')
        sink = sink ? sink : new DataSink(sinkId, description)
        assert(sink?.id == sinkId, "sinkId and sink.id don't match")
        this.sinks.set(sinkId, { sink: sink, stream$: undefined })
        if (stream$) this.setStream(sinkId, stream$)
        return sink
    }

    /**
     * Removes a data sink. Once removed, that Id may be re-used.
     * @param sinkId Data sink to remove.
     */
    public deleteSink(sink?: DataSink, sinkId?: number) {
        if (sink) sinkId = sink.id
        if (sinkId) {
            this.sinks.get(sinkId)?.sink.complete()
            this.sinks.delete(sinkId)
        }

        if (!sink && !sinkId) throw Error('Must specify sink or ID')
    }

    pushPoint(x: number, sinkId: number) {
        let sink = this.getSink(sinkId)
        lastValueFrom(this).then((state) => {
            sink.next([state, new Datum(sinkId, x)])
        })
    }

    /////////////////// STREAM SUPPORT /////////////////////////////////

    /**
     * Sets up the stream and/or hot swaps this stream
     * for another.
     *
     * Makes sure that the stream replaces SWAP events with the
     * correct Play/Pause event and doesn't ever repeat the same state
     *
     * @todo should we disable hot swapping?
     * @param data$ an observable stream of Datum
     */
    public setStream(sinkId: number, data$: Observable<Datum>) {
        let res = this.sinks.get(sinkId)
        if (!res) return
        if (res.stream$) res?.sink?.complete()
        let sink = res.sink

        let filteredState$ = this.pipe(
            map((state) => {
                switch (state) {
                    case OutputStateChange.Swap:
                        {
                            if (this.value == OutputStateChange.Pause) return OutputStateChange.Play
                            else if (this.value == OutputStateChange.Play) return OutputStateChange.Pause
                            else Error('can only swap Play and Pause')
                        }
                        return state
                }
            }),
            distinctUntilChanged(),
        )
        let combined$ = zip(filteredState$, data$) as Observable<[OutputStateChange, Datum]>

        debugStatic(SonificationLoggingLevel.DEBUG, `Loading Data with outputstate ${sink}`)

        sink.setupSubscription(combined$ as Observable<[OutputStateChange, NullableDatum]>)
        /// .pipe(debug(SonificationLoggingLevel.DEBUG, `loading combined stream into Sink ${sink}`))
        /// .subscribe(res?.sink)

        this.sinks.set(sink.id, {
            sink: sink,
            stream$: combined$,
        })
    }

    ////////////////// CONSTRUCTOR /////////////////////////////////////
    /**
     * Set up the output board. set up maps needed to keep track of sinks and outputs.
     */
    private constructor() {
        super(OutputStateChange.Undefined)
        this.sinks = new Map()
        this.pipe(share())
    }

    /**
     * Create a new OutputEngine. Enforces that there is only ever one
     * @returns The OutputEngine's instance..
     */
    public static getInstance(): OutputEngine {
        if (!OutputEngine.outputEngineInstance) {
            OutputEngine.outputEngineInstance = new OutputEngine()
        }

        return OutputEngine.outputEngineInstance
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
