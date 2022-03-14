import { Datum } from './Datum'
import { getSonificationLoggingLevel, OutputStateChange, SonificationLoggingLevel } from './OutputConstants'
import { DataSink } from './DataSink'
import { BehaviorSubject, distinctUntilChanged, map, merge, Observable, shareReplay, tap } from 'rxjs'
import assert from 'assert'
import { create } from 'rxjs-spy'

const DEBUG = false

/**
 * OutputEngine class
 * Has a single instance
 * Users of our library get an instance of this to control it i.e. get sink, play, etc.
 */
export class OutputEngine extends BehaviorSubject<OutputStateChange> {
    public spy = create()

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
            stream$: Observable<OutputStateChange | Datum> | undefined
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
        sink = sinkId ? this.sinks.get(sinkId)?.sink : sink
        sink?.complete()
        if (sink) {
            this.sinks.delete(sink.id)
        }

        if (!sink && !sinkId) throw Error('Must specify sink or ID')
    }

    /**
     * @deprecated
     *
     * pushPoint is sort of legacy. It feeds data in to the sink by calling
     * sink.next(). However this should not be used as things like automatic
     * calls to complete() when the stream ends break when you use this approach.
     *
     * @param x A number
     * @param sinkId Which sink it should go to
     */
    pushPoint(x: number, sinkId: number) {
        let sink = this.getSink(sinkId)
        sink.next(new Datum(sinkId, x))
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
        debugStatic(SonificationLoggingLevel.DEBUG, `Setting Stream: ${sinkId}`)
        let res = this.sinks.get(sinkId)
        if (!res) return
        if (res.stream$) res?.sink?.complete()
        let sink = res.sink

        data$.subscribe({
            complete: () => {
                this.next(OutputStateChange.Stop)
                sink.complete()
                this.deleteSink(sink)
            },
        })

        let filteredState$ = this.pipe(
            map((state) => {
                switch (state) {
                    case OutputStateChange.Swap:
                        {
                            debugStatic(SonificationLoggingLevel.DEBUG, 'Swapping Play and Pause')
                            if (this.value == OutputStateChange.Pause) return OutputStateChange.Play
                            else if (this.value == OutputStateChange.Play) return OutputStateChange.Pause
                            else Error('can only swap Play and Pause')
                        }
                        return state
                    default:
                        debugStatic(SonificationLoggingLevel.DEBUG, `state changed to ${OutputStateChange[state]}`)
                        return state
                }
            }),
            // distinctUntilChanged(),
            // shareReplay doesn't seem to work as expected
            // only works for adding new sinks to the chain
            // does not update OutputStateChange for newly added handlers or outputs
            shareReplay(1),
        )
        let combined$ = merge(filteredState$, data$)

        sink.setupSubscription(combined$)

        this.sinks.set(sink.id, {
            sink: sink,
            stream$: combined$,
        })
    }

    ////////////////// CONSTRUCTOR /////////////////////////////////////
    /**
     * Set up the output board. set up maps needed to keep track of sinks and outputs.
     *
     * Also turns this into a "hot" stream
     */
    private constructor() {
        super(OutputStateChange.Undefined)
        this.sinks = new Map()
        this.spy.show()
        this.spy.log()
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

//////////// DEBUGGING //////////////////
import { tag } from 'rxjs-spy/operators/tag'

const debug = (level: number, message: string, watch: boolean) => (source: Observable<any>) => {
    if (watch) {
        return source.pipe(tag(message))
    } else {
        return source.pipe(
            tap((val) => {
                debugStatic(level, message + ': ' + val)
            }),
        )
    }
}

const debugStatic = (level: number, message: string) => {
    if (DEBUG) {
        if (level >= getSonificationLoggingLevel()) {
            console.log(message)
        } //else console.log('debug message dumped')
    }
}
