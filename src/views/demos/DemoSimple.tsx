import React from 'react'
import { Observable, of, tap, timer, zip, delay } from 'rxjs'
import { DataSink } from '../../sonification/DataSink'
import { Datum } from '../../sonification/Datum'
import { OutputEngine } from '../../sonification/OutputEngine'
import { NoteHandler } from '../../sonification/handler/NoteHandler'
import { IDemoView } from './IDemoView'
import {
    getSonificationLoggingLevel,
    OutputStateChange,
    SonificationLoggingLevel,
} from '../../sonification/OutputConstants'
import { Demo } from '../../pages/Demo'


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
     * Holder for the current DataSink object that starts after a delay
     */
     protected delaySink: DataSink | undefined
     public getDelaySink() {
        if(this.delaySink) return this.delaySink
        else return this.initializeDelaySink()
         }
    initializeDelaySink() {
        // SONIFICATION
        debugStatic(SonificationLoggingLevel.DEBUG, `adding sink`)

        this.delaySink = OutputEngine.getInstance().addSink('SimpleDemoDelaySink')

        // debugStatic(SonificationLoggingLevel.DEBUG, `adding Handler`)

        // this.sink?.addDataHandler(new NoteHandler())

        debugStatic(SonificationLoggingLevel.DEBUG, `success initializing sink ${this.sink}`)

        return this.delaySink
    }

    /**
     * @todo fix comments and debug
     * @param data Not sure what this is -- someone else wrote ti
     */
    public onPause = (data: any) => {
        OutputEngine.getInstance().next(OutputStateChange.Pause)
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
    public onPlay = (data: Array<number>) => {
        debugStatic(SonificationLoggingLevel.DEBUG, `in onPlay ${this.sink}, ${this.delaySink} `)
        debugStatic(SonificationLoggingLevel.DEBUG, `adding sink`)

        if (this.sink == undefined) this.sink = this.initializeSink()

        //if(this.delaySink == undefined) this.delaySink = this.initializeDelaySink()

        let id = this.sink ? this.sink.id : 0

        //let delayID = this.delaySink ? this.delaySink.id : 1

        let dataCopy = Object.assign([],data)
        let data$ = of(...data) //.slice(0, 8))
        let delayData$ = of(...dataCopy) //.slice(0, 8))


        let timer$ = timer(0, 250).pipe(debug(SonificationLoggingLevel.DEBUG, 'point number'))

        let source$ = zip(data$, timer$, (num, time) => new Datum(id, num)).pipe(
            debug(SonificationLoggingLevel.DEBUG, 'point'),
        )

        /// Make sure to delete the sink when the source is
        source$.subscribe({
            complete: () => {
                this.sink = undefined
                //Demo.setState({ playbackLabel: "Play" })
            },
        })

        debugStatic(SonificationLoggingLevel.DEBUG, 'calling setStream')
        OutputEngine.getInstance().setStream(id, source$)

        debugStatic(SonificationLoggingLevel.DEBUG, `adding Handler`)
        this.sink?.addDataHandler(
            new NoteHandler([
                data.reduce((prev, curr) => (prev < curr ? prev : curr)), // min
                data.reduce((prev, curr) => (prev > curr ? prev : curr)),
            ],-1),
        ) // max
        debugStatic(SonificationLoggingLevel.DEBUG, `success`)


        /*let delayTimer$ = timer(0, 250).pipe(debug(SonificationLoggingLevel.DEBUG, 'point number'))

        let delaySource$ = zip(delayData$, delayTimer$, (num, time) => new Datum(delayID, num)).pipe(delay(1000)).pipe(
            debug(SonificationLoggingLevel.DEBUG, 'delayPoint'),
        )
        OutputEngine.getInstance().setStream(delayID, delaySource$)

        */
        /// Make sure to delete the sink when the source is
        /*delaySource$.subscribe({


        /// Make sure to delete the sink when the source is
            complete: () => {
                this.delaySink = undefined
                //Demo.setState({ playbackLabel: "Play" })
            },
        })


        debugStatic(SonificationLoggingLevel.DEBUG, `adding Handler to ${this.delaySink}`)
        this.delaySink?.addDataHandler(
            new NoteHandler([
                data.reduce((prev, curr) => (prev < curr ? prev : curr)), // min
                data.reduce((prev, curr) => (prev > curr ? prev : curr)),
            ],1),

        )*/ // max


        console.log('sending play')
        // Change State
        OutputEngine.getInstance().next(OutputStateChange.Play)
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
        OutputEngine.getInstance().next(OutputStateChange.Stop)
        if (this.sink) {
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
        debugStatic(SonificationLoggingLevel.DEBUG, `adding sink`)

        this.sink = OutputEngine.getInstance().addSink('SimpleDemoSink')

        // debugStatic(SonificationLoggingLevel.DEBUG, `adding Handler`)

        // this.sink?.addDataHandler(new NoteHandler())

        debugStatic(SonificationLoggingLevel.DEBUG, `success initializing sink ${this.sink}`)

        return this.sink
    }
}

const debug = (level: number, message: string) => (source: Observable<any>) =>
    source.pipe(
        tap((val) => {
            debugStatic(level, message + ': ' + val)
        }),
    )
const debugStatic = (level: number, message: string) => {

    if (DEBUG) {
        if (level >= getSonificationLoggingLevel()) {
            console.log(message)
        } //else console.log('debug message dumped')
    }

}
