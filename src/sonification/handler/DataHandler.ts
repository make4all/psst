import { DataSink } from '../DataSink'
import { Datum } from '../Datum'
import { DatumOutput } from '../output/DatumOutput'

/**
 * A DataHandler class is used to decide how to output each data point.
 */
export abstract class DataHandler {
    /**
     * Store a DatumOutput if this DataHandler has one
     */
    public outputs: Array<DatumOutput>

    /**
     * Store the sink this DataHandler is added to
     */
    public sink?: DataSink

    /**
     *
     * @param sink. DataSink that is providing data to this Handler.
     * @param output An optional way to output the data
     */
    constructor(sink?: DataSink, output?: DatumOutput) {
        this.outputs = new Array()
        if (output) this.outputs.push(output)
        if (sink) this.sink = sink
    }

    /**
     * Decides whether processing should stop and optionally assigns an output type.
     *
     * @param datum
     * @returns true if processing should continue
     */
    public handleDatum(datum?: Datum): boolean {
        this.outputs.map((output) => {
            output.update(datum)
        })
        return true
    }

    /**
     * Set up for output. Datum will only be outputted after this is called.
     */
    public start() {
        console.log(`DataHandler.start ${this}`)
        this.outputs.map((output) => output.start())
    }

    /**
     * Halt output of any new data that arrive.
     */
    public stop() {
        console.log(`DataHandler.stop ${this}`)
        this.outputs.map((output) => output.stop())
    }

    /**
     * Pause output.
     */
    public pause() {
        console.log(`DataHandler pause ${this}`)
        this.outputs.map((output) => output.pause())
    }

    public toString(): string {
        return `DataHandler ${this}`
    }
}
