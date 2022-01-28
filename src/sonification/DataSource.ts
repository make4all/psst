import { Datum } from './Datum'
import { DatumDisplay } from './displays/DatumDisplay'
import { Template } from './templates/Template'
import { bindCallback, finalize, isEmpty, Observable, Subscription } from 'rxjs'

/**
 * The source for a stream of data
 * @method id() Returns a unique id for this data source
 * @method toString returns a description of this Data Source
 * @field stats A dictionary of statistics about the data that has arrived so far at this Data Source
 * @field calculators A dictionary of calculators that calculate the statistics.
 * @field templates An array of Templates which can filter or display a given data point
 */

const DEBUG = false

export class DataSource {
    //////////////////////////////// FIELDS ///////////////////////////////////
    /**
     * A unique id far this data source
     */
    public id: number

    /**
     * A description of this data source for documentation
     */
    private _description: String

    //////////////////////////////// STREAMING DATA SUPPORT ///////////////////////////////////

    /**
     * The observable that this template is playing
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
        this._stream = data
        console.log(`setting up stream for ${this}`)
        if (data) {
            this.startDisplays()
            this.subscription = data.subscribe((value) => {
                this.handleNewDatum(value as Datum)
            })

            data.pipe(finalize(() => bindCallback(this.handleEndStream)))
        }
    }

    //////////////////////////////// STATS ///////////////////////////////////
    /**
     * A list of stats that describe this DataSource.
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
     * Update the statistics about the data source based on the new arrival
     * @param datum The datum to analyze
     */
    protected updateStats(datum: Datum) {
        this._calculators.forEach((calculator, key) => {
            let stat = this._stats[key]
            let calc = this._calculators[key] as (datum: Datum, stat: number) => number
            this._stats[key] = calc(datum, stat)
        })

        //console.log(`${this.printStats()} `)
    }

    /**
     * Empty out all the stats, e.g. if the stream has ended.
     */
    public clearStats() {
        this._stats = new Map<string, number>()
    }

    private _calculators: Map<string, (datum: Datum, stat: number) => number>
    /**
     * Add or replace a calculator for a statistic.
     * @param key The key for the statistic
     * @param calc A function that takes as input the current data point and previous version of this statistic and outputs an update
     * @param initial A number to initialize the statistic with.
     */
    public setCalculator(key: string, calc: (datum: Datum, stat: number) => number, initial: number) {
        this._calculators[key] = calc
        this._stats[key] = initial
        if (DEBUG) console.log(`adding calculator named ${key}: ${calc}`)
        if (DEBUG) console.log(this.printStats())
    }
    public removeCalculator(name) {
        this._calculators.delete(name)
        this._stats.delete(name)
    }

    //////////////////////////////// TEMPLATES ///////////////////////////////////
    /**
     * A list of templates. Templates are applied to each new Datum when it arrives.
     */
    private _templates: Array<Template>
    public removeTemplate(template: Template) {
        this._templates = this._templates.filter((template) => template !== template)
    }
    public addTemplate(template: Template) {
        this._templates.push(template)
    }

    //////////////////////////////// CONSTRUCTOR ///////////////////////////////////

    /**
     * Instantiate a DataSource
     * @param id A unique ID for the data source
     * @param description A description for the data source
     */
    constructor(id: number, description: String) {
        this.id = id
        this._description = description
        this._templates = new Array<Template>()
        this._stats = new Map<string, number>()
        this._calculators = new Map<string, (datum: Datum, stat: number) => number>()
    }

    //////////////////////////////// CALLBACKS ///////////////////////////////////

    /**
     * Calculate stats and then assign displays
     * Called each time a new Datum arrives in the stream
     *
     * @param datum The datum to display
     */
    public handleNewDatum(datum: Datum) {
        this.updateStats(datum)
        this.updateDisplays(datum)
    }

    /**
     * The stream associated with this data source has ended.
     *
     * @param stream The stream that ended
     */
    public handleEndStream() {
        console.log(`handleEndStream for ${this}`)
        this.subscription?.unsubscribe()
        this.setStream(undefined)
        this.clearStats()
        this.stopDisplays()
    }

    //////////////////////////////// HELPER METHODS ///////////////////////////////////

    /**
     * Assign display objects and/or filter or transform the new arrival
     * @todo this doesn't exit if handleDatum false
     * @param datum The datum to display
     */
    protected updateDisplays(datum?: Datum) {
        this._templates.map((template) => {
            let result = template.handleDatum(datum)
            if (!result) return
            //console.log(`calculatied note ${template} for ${datum}`)
        })
    }

    public stopDisplays() {
        this._templates.map((template) => template.stop())
    }

    public startDisplays() {
        this._templates.map((template) => template.start())
    }

    public pauseDisplays() {
        this._templates.map((template) => template.pause())
    }
    public toString() {
        let description = this._description
        this._stats.forEach((name, val) => {
            description += ` (${name}, ${val})`
        })
        return description
    }
}
