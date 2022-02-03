import { Datum } from './Datum'
import { Observable, Subscription } from 'rxjs'
import { Calculator } from './stat/Calculator'
import { OutputState } from './OutputConstants'
import { DataHandler } from './handler/DataHandler'

const DEBUG = false

/**
 * The DataSink for a stream of data
 */
export class DataSink {
    //////////////////////////////// FIELDS ///////////////////////////////////
    /**
     * A unique id for this DataSink
     */
    public id: number

    /**
     * the overall state of all the outputs attached to this DataSink.
     */
    public outputState = OutputState.Stopped

    /**
     * A description of this DataSink for documentation
     */
    private _description: String

    /**
     * An event hook to know when the data stream for a DataSink has ended.
     * The OutputEngine needs to handle this for each DataSink to know when a sink has stopped because the data stream has ended.
     * If this event is not handled, the OutputEngine will not know when the datastream for the sink has ended.
     * Consequently, the OutputEngine's outputState never goes to stop after initial call to onPlay.
     */
    public onStreamEnded?: () => void

    //////////////////////////////// STREAMING DATA SUPPORT ///////////////////////////////////

    /**
     * The observable that this DataSink is playing
     * When the stream is set, each new value will trigger a call to
     * handleNewDatum() and at the end handleEndStream() will be called.
     */
    private _stream?: Observable<Datum>
    private subscription: Subscription | undefined
    public get stream(): Observable<Datum> {
        if (this._stream) return this._stream
        else throw Error('no stream')
    }
    public setStream(data?: Observable<Datum>) {
        // this._stream = data
        console.log(`setting up stream for ${this}`)
        if (data) {
            this.startOutputs()
            this.subscription = data.subscribe(
                (value) => {
                    this.handleNewDatum(value as Datum)
                },
                () => this.handleEndStream(),
                () => this.handleEndStream(),
            )
        }
        this._stream = data
    }

    //////////////////////////////// STATS ///////////////////////////////////
    /**
     * A list of stats that describe this DataSink.
     * Stats each have an associated calculator which can update them every time a new datum arrives
     */
    private _stats: Map<string, number>

    /**
     * Get the value for a stat.
     *
     * @param key The key for the stat
     * @returns The stat's value
     */
    public getStat(key: string) {
        if (DEBUG) console.log(`getting stat ${key} ${this._stats.get(key)}`)
        let stat = this._stats.get(key)
        if (stat) return stat
        throw new Error(`statistic ${key} not defined`)
    }

    /**
     * Directly set a statistic. This should only be used for statistics that are static (calculated once),
     * otherwise, addCalculator if a statistic should be updated
     * @param key
     * @param stat the statistic
     */
    public setStat(key: string, stat: number) {
        this._stats.set(key, stat)
        if (DEBUG) console.log(`setStat called with ${key} ${stat}`)
    }

    /**
     * printStats generates a string description of the statistics
     * @param key If key is provided, it only returns that single statistic
     * @returns The description
     */
    public printStats(key?: string): string {
        let stats = ''
        if (key) stats = `${key}: ${this.getStat(key)})`
        else {
            this._stats.forEach((stat: number, key: string) => {
                stats += `${key}: ${stat})`
            })
        }
        return stats
    }

    /**
     * Update the statistics about the DataSink based on the new arrival
     * @param datum The datum to analyze
     */
    protected updateStats(datum: Datum) {
        this._calculators.forEach((calculator, key) => {
            let stat = this._stats[key]
            let calc = this._calculators[key] as Calculator
            this._stats[key] = calc.update(datum, stat)
        })

        //console.log(`${this.printStats()} `)
    }

    /**
     * Empty out all the stats, e.g. if the stream has ended.
     */
    public clearStats() {
        this._stats = new Map<string, number>()
    }

    private _calculators: Map<string, Calculator>

    /**
     * Add or replace a calculator for a statistic.
     * @param key The key for the statistic
     * @param calc A function that takes as input the current data point and previous version of this statistic and outputs an update
     * @param initial A number to initialize the statistic with.
     */
    public setCalculator(key: string, calculator: Calculator, initial: number) {
        this._calculators[key] = calculator
        this._stats[key] = initial
        if (DEBUG) console.log(`adding calculator named ${key}: ${calculator}`)
        if (DEBUG) console.log(this.printStats())
    }
    public removeCalculator(name) {
        this._calculators.delete(name)
        this._stats.delete(name)
    }

    //////////////////////////////// HANDLERS ///////////////////////////////////
    /**
     * A list of DataHandlers. DataHandlers are passed each new Datum when it arrives.
     */
    private _dataHandlers: Array<DataHandler>
    public removeDataHandler(dataHandler: DataHandler) {
        this._dataHandlers = this._dataHandlers.filter((dataHandler) => dataHandler !== dataHandler)
    }
    public addDataHandler(dataHandler: DataHandler) {
        this._dataHandlers.push(dataHandler)
    }

    //////////////////////////////// CONSTRUCTOR ///////////////////////////////////

    /**
     * Instantiate a DataSink
     * @param id A unique ID for the DataSink
     * @param description A description for the DataSink
     */
    constructor(id: number, description: String) {
        this.id = id
        this._description = description
        this._dataHandlers = new Array<DataHandler>()
        this._stats = new Map<string, number>()
        this._calculators = new Map<string, Calculator>()
    }

    //////////////////////////////// CALLBACKS ///////////////////////////////////

    /**
     * Calculate stats and then assign outputs
     * Called each time a new Datum arrives in the stream
     *
     * @param datum The datum to output
     */
    public handleNewDatum(datum: Datum) {
        if (this.outputState == OutputState.Stopped) return

        this.updateStats(datum)
        this.updateOutputs(datum)
    }

    /**
     * The stream associated with this DataSink has ended.
     *
     * @param stream The stream that ended
     */
    public handleEndStream() {
        if (DEBUG) console.log(`handleEndStream for ${this}`)
        this.subscription?.unsubscribe()
        this.clearStats()
        this.stopOutputs()
        if (this.onStreamEnded) this.onStreamEnded()
    }

    //////////////////////////////// HELPER METHODS ///////////////////////////////////

    /**
     * Assign output objects and/or filter or transform the new arrival
     * @todo this doesn't exit if handleDatum false
     * @param datum The datum to output
     */
    protected updateOutputs(datum?: Datum) {
        this._dataHandlers.map((dataHandler) => {
            let result = dataHandler.handleDatum(datum)
            if (!result) return
        })
    }

    public stopOutputs() {
        this.outputState = OutputState.Stopped

        this._dataHandlers.map((dataHandler) => dataHandler.stop())
    }

    public startOutputs() {
        this.outputState = OutputState.Playing

        this._dataHandlers.map((dataHandler) => dataHandler.start())
    }

    public pauseOutputs() {
        if (DEBUG) console.log('pausing handlers.')
        this.outputState = OutputState.Paused
        this._dataHandlers.map((dataHandler) => dataHandler.pause())
    }

    public toString() {
        let description = this._description
        description += `(id: ${this.id})`
        this._stats.forEach((name, val) => {
            description += ` (${name}, ${val})`
        })
        return description
    }
}
