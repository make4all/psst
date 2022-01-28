import React from 'react'
import { map, take, timer } from 'rxjs'
import { DataSource } from '../../sonification/DataSource'
import { Datum } from '../../sonification/Datum'
import { DisplayBoard } from '../../sonification/displays/DisplayBoard'
import { NoteTemplate } from '../../sonification/templates/NoteTemplate'
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
     * There can only be one display board! But we need a pointer to it
     */
    protected displayBoardInstance: DisplayBoard
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
     * Holder for the current data source object
     */
    protected source: DataSource | undefined
    public getSource(): DataSource {
        if (this.source) return this.source
        else return this.initializeSource()
    }
    /**
     * Constructor
     * @param props Normal react props
     */
    constructor(props: DemoSimpleProps) {
        super(props)
        this.displayBoardInstance = DisplayBoard.getInstance()
    }

    /**
     * @todo fix comments and debug
     * @param data Not sure what this is -- someone else wrote ti
     */
    public onPause = (data: any) => {
        this.isStreamInProgress = false
        this.displayBoardInstance.onPause()
    }

    /**
     * The play button has been pressed and data set specified. Time to start sonificatino
     *
     * First, since we now know what data we are playing, this adds a max/min calculator
     * to our data source. The calculation is based on the full data set and always returns the
     * same value as a result
     * @todo think about how to set up static calculations so they don't run over and over again.
     *
     * Second, we make a callback to the display board instance to let it know to shift into play mode
     * Third, we create a data stream
     *
     * @param data The data set to be played
     */
    public onPlay = (data: any) => {
        console.log(`in onPlay ${this.source}`)
        this.isStreamInProgress = true

        if (this.source) {
            this.getSource().handleEndStream()
            console.log('called handleEndStream')
        } else this.initializeSource()

        // SONIFICATION
        this.getSource().setStat('max', Math.max(...data))
        this.getSource().setStat('min', Math.min(...data))
        console.log(`setting max and min to ${this.getSource()}`)

        // SONIFICATION INITIALIZATION
        this.displayBoardInstance.onPlay()

        let id = this.source ? this.source.id : 0
        let source = timer(0, 200).pipe(
            map((val) => new Datum(id, data[val])),
            take(data.length),
        )
        console.log('setStream in demo')
        this.getSource().setStream(source)
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
        if (this.source) {
            this.source.handleEndStream()
            this.displayBoardInstance.deleteSource(this.source)
        }
    }

    ////////// HELPER METHODS ///////////////
    /**
     * This initializes the source, but to work fully, it is important to also
     * assign max and min values when the data set is specified.
     * @returns a source
     */
    public initializeSource() {
        // SONIFICATION
        this.source = this.displayBoardInstance.addSource('SimpleDemo')
        let template = new NoteTemplate(this.source)
        console.log(`adding template ${template}`)
        this.source.addTemplate(template)
        // this.source.addTemplate(new FilterRangeTemplate(new NoiseSonify(), [4, 10]))

        return this.source
    }
}
