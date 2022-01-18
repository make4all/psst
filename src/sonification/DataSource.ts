import { Datum } from "./Datum";
import { DatumDisplay } from "./displays/DatumDisplay";
import { Template } from "./templates/Template";


/**
 * The source for a stream of data
 * @method id() Returns a unique id for this data source
 * @method toString returns a description of this Data Source
 * @field stats A dictionary of statistics about the data that has arrived so far at this Data Source
 * @field calculators A dictionary of calculators that calculate the statistics. 
 * @field templates An array of Templates which can filter or display a given data point
 */

const DEBUG = true;

export class DataSource {
    //////////////////////////////// FIELDS ///////////////////////////////////
    /**
     * A unique id far this data source
     */
    private _id: number;
    public id(): number {
        return this._id;
    }

    /**
     * A description of this data source for documentation
     */
    private _description: String;


    /**
     * A list of stats that describe this DataSource. 
     * Stats each have an associated calculator which can update them every time a new datum arrives
     */
    private _stats: Map<string, number>;
    public getStat(key: string) { return this._stats[key]; }
    public printStats(key?: string): string {
        let stats = "";
        if (key) stats = `${key}: ${this.getStat(key)})`
        else {
            this._stats.forEach((stat: number, key: string) => {
                stats += `${key}: ${stat})`
            });
        }
        return stats;
    }

    private _calculators: Map<string, (datum: Datum, stat: number) => number>;
    public addCalculator(name: string, calc: (datum: Datum, stat: number) => number, initial:number) {
        this._calculators[name] = calc;
        this._stats[name] = initial;
        if (DEBUG) console.log(`adding calculator named ${name}: ${calc}`);
        //if (DEBUG) console.log(this.printStats());
    }
    public removeCalculator(name) {
        this._calculators.delete(name);
        this._stats.delete(name)
    }

    /**
     * A list of templates. Templates are applied to each new Datum when it arrives.
     */
    private _templates: Array<Template>;
    public removeTemplate(template:Template) {
        this._templates = this._templates.filter(template => template !== template);
    }
    public addTemplate(template: Template) {
        this._templates.push(template);
    }

    public displays(): Array<DatumDisplay> {
        let displays = new Array<DatumDisplay>();
        this._templates.map((template) => {
            console.log(`checking for displays in ${template.toString()}`)
            console.log(`template ${template.toString()} has displays`)
            template.displays.map((display) => console.log(`display: ${display}`));
            template.displays.map((display) => displays.push(display));
        });
        return displays;
    }

    //////////////////////////////// CONSTRUCTOR ///////////////////////////////////

    /**
     * Instantiate a DataSource
     * @param id A unique ID for the data source
     * @param description A description for the data source
     */
    constructor(id: number, description: String) {
        this._id = id;
        this._description = description;
        this._templates = new Array<Template>();
        this._stats = new Map<string, number>();
        this._calculators = new Map<string, (datum: Datum, stat: number) => number>();
    }

    //////////////////////////////// METHODS ///////////////////////////////////

    /**
     * Calculate stats and then assign displays
     * @param datum The datum to display
     */
    public handleNewDatum(datum: Datum) {
        this.updateStats(datum);
        this.updateDisplays(datum);
    }

    //////////////////////////////// HELPER METHODS ///////////////////////////////////

    /**
     * Update the statistics about the data source based on the new arrival
     * @param datum The datum to analyze
     */
    protected updateStats(datum: Datum) {
        for (let key in this._stats) {
            let stat = this._stats[key]
            let calc = this._calculators[key] as (datum: Datum, stat: number) => number
            this._stats[key] = calc(datum, stat);
        }
        console.log(`${this.printStats()} `);
    }  

    /**
     * Assign display objects and/or filter or transform the new arrival
     * @param datum The datum to display
     */
    protected updateDisplays(datum: Datum) {
        this._templates.map((template) => {
            template.handleDatum(datum, this);
            console.log(`calculatied note ${template} for ${datum}`)
        });
    }

    public toString() {
        return this._description;
    }

}
