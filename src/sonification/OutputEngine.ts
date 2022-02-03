import { Datum } from './Datum'
import { OutputState } from './OutputConstants'
import { DataSink } from './DataSink'

const DEBUG = false

/**
 * OutputEngine class
 * Has a single instance
 * Users of our library get an instance of this to control it i.e. get sink, play, etc.
 */
export class OutputEngine {
    /**
     * The Output Engine. Enforce that there is only ever one.
     * @todo ask group if there is a better way to enforce this.
     */
    private static outputEngineInstance: OutputEngine

    /**
     * Whether or not output is currently playing.
     * Always begin in a "stopped" state since there is
     * no data to output yet at construction time
     */
    private _outputState = OutputState.Stopped
    public get outputState(): OutputState {
        return this._outputState
    }
    public set outputState(value: OutputState) {
        if (DEBUG) console.log('changing output state')
        this._outputState = value
    }
    /**
     * Tracks the previous output state. Used for firing the onOutputStateChanged event that users can hook into. This event hook can be used to drive the UI.
     */
    private _previousOutputState

    /**
     * Event that users of the OutputEngine can hook into to be alerted when the playback state changes.
     *
     */
    public onOutputStateChanged?: (state: OutputState) => void

    /**
     * A map of Data sinks handled by the Output Engine.
     */
    private sinks: Map<number, DataSink>

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
     * @param sinkId An id
     * @returns true if the id is unique (not already in sinks)
     */
    public isUnique(sinkId: number): boolean {
        if (sinkId in this.sinks.keys) {
            return false
        }
        return true
    }

    /**
     * Get a sink given an Id. Throws an error of sinkId doesn't exist.
     * @param sinkId
     * @returns Returns the DataSink associated with sinkId.
     */
    public getSink(sinkId: number): DataSink {
        let sink = this.sinks.get(sinkId)
        if (!sink) throw new Error(`no sink associated with ${sinkId}`)
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
    public addSink(description?: string, sinkId?: number, sink?: DataSink): DataSink {
        if (!description) description = 'Unknown Sink'
        if (sink) {
            if (!sinkId) sinkId = sink.id
            if (sinkId != sink.id) throw Error("sinkId and sink.id don't match")
        } else {
            if (sinkId) {
                if (!this.isUnique(sinkId)) throw Error('sinkId is not unique')
                sink = new DataSink(sinkId, description)
            } else {
                sink = new DataSink(this.getUniqueId(), description)
            }
        }
        sink.onStreamEnded = () => this.handleSinkStreamEnded()
        this.sinks.set(sink.id, sink)
        return sink
    }
    handleSinkStreamEnded() {
        let didAllSinksEndPlaying = true
        for (let [id, sink] of this.sinks) {
            if (sink.outputState != OutputState.Stopped) {
                didAllSinksEndPlaying = false
                break
            }
        }
        if (didAllSinksEndPlaying) {
            this.outputState = OutputState.Stopped
            this.fireOutputStateChangedEvent()
            if (DEBUG) console.log('stream has ended. stopping output')
        }
    }

    /**
     * Removes a data sink. Once removed, that Id may be re-used.
     * @param sinkId Data sink to remove.
     */
    public deleteSink(sink?: DataSink, sinkId?: number) {
        if (sink) this.sinks.delete(sink.id)
        if (sinkId) this.sinks.delete(sinkId)
        if (!sink && !sinkId) throw Error('Must specify sink or ID')
    }

    /**
     * Set up the output board. set up maps needed to keep track of sinks and outputs.
     */
    private constructor() {
        this.sinks = new Map()
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

    //needs extensive testing.
    public onStop() {
        // @todo do I need to do anything differently if was stopped instead of paused?
        // The answer is yes if we ever want to handl control to a new/different audio context
        // maybe have an option for "halt" instead that ends everything?

        if (DEBUG) console.log('stopping. output state is paused')
        this.sinks.forEach((sink: DataSink, key: number) => sink.handleEndStream())
        this._outputState = OutputState.Stopped
        // this.audioCtx.close() -- gives everything up, should only be done at the very very end.
    }

    //needs extensive testing.
    public onPlay() {
        // @todo do I need to do anything differently if was stopped instead of paused?
        // The answer is yes if we ever want to handl control to a new/different audio context
        if (this.outputState == OutputState.Outputting) {
            if (DEBUG) console.log('playing')
        } else {
            if (DEBUG) console.log('setting up for playing')

            this.startSinks()
            this._outputState = OutputState.Outputting
            this.fireOutputStateChangedEvent()
        }
    }

    /**
     * Triggers all existing sinks to show themselves (e.g. set up for playing)
     *
     * @todo if a new sink is added after onPlay it won't get connected
     * @todo what about visually outputing things
     */
    private startSinks() {
        if (DEBUG) console.log(`starting sinks ${this.sinks.size}`)
        this.sinks.forEach((sink: DataSink, key: number) => sink.startOutputs())
    }

    //needs extensive testing.
    public onPause() {
        if (DEBUG) console.log('Pausing. Playback state is paused')
        this._outputState = OutputState.Paused
        this.sinks.forEach((sink: DataSink, key: number) => sink.pauseOutputs())
        this.fireOutputStateChangedEvent()
    }

    /**
     * Plays each data point as it arrives.
     * @param point The point to sonify
     * @param sinkId The sink that point is associated with
     * @returns The resulting data point
     */
    public pushPoint(point: number, sinkId: number): Datum {
        // datum: Datum, sink: Datasink) {
        if (DEBUG) console.log(`pushPoint ${point} for ${sinkId} during ${this.outputState} `)
        let sink = this.sinks.get(sinkId)
        if (!sink) throw new Error(`no sink associated with ${sinkId}`)
        if (DEBUG) console.log(`Sink ${sink}`)
        let datum = new Datum(sinkId, point)
        switch (this.outputState) {
            case OutputState.Stopped: // ignore the point
                if (DEBUG) console.log(`playback: Stopped`)
                break
            case OutputState.Outputting: {
                if (DEBUG) console.log(`calling ${sink} to handle ${{ datum }}`)
                sink.handleNewDatum(datum)

                break
            }
            case OutputState.Paused: {
                if (DEBUG) console.log(`playback: paused`)
                /// @todo what should we do? Keep a buffer of points and delay them? something else?
            }
        }
        return datum
    }

    private fireOutputStateChangedEvent() {
        if (this._outputState != this._previousOutputState) {
            if (this.onOutputStateChanged) this.onOutputStateChanged(this._outputState)
            this._previousOutputState = this._outputState
        }
    }
}
