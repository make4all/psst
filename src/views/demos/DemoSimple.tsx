import React from 'react'
import { map, take, timer } from 'rxjs'
import { DataSink } from '../../sonification/DataSink'
import { Datum } from '../../sonification/Datum'
import { OutputEngine } from '../../sonification/OutputEngine'
import { NoteHandler } from '../../sonification/handler/NoteHandler'
import { IDemoView } from './IDemoView'

const DEBUG = false

export interface DemoSimpleState {}

export interface DemoSimpleProps {
    dataSummary: any
}

export class DemoSimple<DemoSimpleProps, DemoSimpleState>
    extends React.Component<DemoSimpleProps, DemoSimpleState>
    implements IDemoView
{
    /**
     * Are we streaming data right now?
     */
    protected isStreamInProgress = false
    /**
     * @todo implement pausing
     * The index into our data set that we were at when we were paused
     */
    protected current = 0

    /**
     * Holder for data set to sonify
     */
    protected data: number[] | undefined

    /**
     * Holder for the current DataSink object
     */
    protected sink: DataSink | undefined
    public getSink(): DataSink {
        if (this.sink) return this.sink
        else return this.initializeSink()
    }

    /**
     * @todo fix comments and debug
     * @param data Not sure what this is -- someone else wrote ti
     */
    public onPause = (data: any) => {
        this.isStreamInProgress = false
        OutputEngine.getInstance().onPause()
    }

    /**
     * The play button has been pressed and data set specified. Time to start sonificatino
     *
     * First, since we now know what data we are playing, this adds a max/min calculator
     * to our DataSink. The calculation is based on the full data set and always returns the
     * same value as a result
     * @todo think about how to set up static calculations so they don't run over and over again.
     *
     * Second, we make a callback to the OutputEngine instance to let it know to shift into play mode
     * Third, we create a data stream
     *
     * @param data The data set to be played
     */
    public onPlay = (data: any) => {
        console.log(`in onPlay ${this.sink}`)
        this.isStreamInProgress = true

        if (!this.sink) this.initializeSink()

        // SONIFICATION
        this.getSink().setStat('max', Math.max(...data))
        this.getSink().setStat('min', Math.min(...data))
        console.log(`setting max and min to ${this.getSink()}`)

        // SONIFICATION INITIALIZATION
        OutputEngine.getInstance().onPlay()

        let id = this.sink ? this.sink.id : 0
        let source = timer(0, 200).pipe(
            map((val) => new Datum(id, data[val], val)),
            take(data.length),
        )
        console.log('setStream in demo')
        this.getSink().setStream(source)
    }

    public render() {
        return (
            <div>
                <p> press play to hear a simple sonification</p>
            </div>
        )
    }

    /**
     * Garbage collect our data stream.
     */
    public componentWillUnmount() {
        if (this.sink) {
            this.sink.handleEndStream()
            OutputEngine.getInstance().deleteSink(this.sink)
        }
    }

    ////////// HELPER METHODS ///////////////
    /**
     * This initializes the sink, but to work fully, it is important to also
     * assign max and min values when the data set is specified.
     * @returns a sink
     */
    public initializeSink() {
        // SONIFICATION
        this.sink = OutputEngine.getInstance().addSink('SimpleDemo')
        let handler = new NoteHandler(this.sink)
        console.log(`adding handler ${handler}`)
        this.sink.addDataHandler(handler)
        // this.sink.addDataHandler(new FilterRangeHandler(new NoiseSonify(), [4, 10]))

        return this.sink
    }
}
