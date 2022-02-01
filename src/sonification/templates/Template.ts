import { DataSource } from '../DataSource'
import { Datum } from '../Datum'
import { DatumDisplay } from '../displays/DatumDisplay'

/**
 * A template class is used to decide how to display each data point.
 */
export abstract class Template {
    /**
     * Store a display if this template has one
     */
    public displays: Array<DatumDisplay>

    /**
     * Store the source this template is added to
     */
    public source?: DataSource

    /**
     *
     * @param display An optional way to display the data
     */
    constructor(source?: DataSource, display?: DatumDisplay) {
        this.displays = new Array()
        if (display) this.displays.push(display)
        if (source) this.source = source
    }

    /**
     * Decides whether processing should stop and optionally assigns a display type.
     *
     * @param datum
     * @param source
     * @returns true if processing should continue
     */
    public handleDatum(datum?: Datum): boolean {
        this.displays.map((display) => {
            //console.log(`updating display ${display.toString()} with ${datum.toString()}`)
            display.update(datum)
        })
        return true
    }

    /**
     * Set up for display. Datum will only be displayed after this is called.
     */
    public start() {
        console.log(`template.start ${this}`)
        this.displays.map((display) => display.start())
    }

    public stop() {
        console.log(`template.stop ${this}`)
        this.displays.map((display) => display.stop())
    }

    public pause() {
        console.log(`template pause ${this}`)
        this.displays.map((display) => display.pause())
    }

    public toString(): string {
        return `Template ${this}`
    }
}
